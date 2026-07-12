from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import json
import mimetypes
import os
import secrets
import string
import threading


ROOT = Path(__file__).resolve().parent
ROOMS = {}
LOCK = threading.Lock()
CODE_ALPHABET = string.ascii_uppercase + string.digits


def new_code():
    while True:
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        if code not in ROOMS:
            return code


def read_json(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    if length == 0:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def error(handler, status, message):
    json_response(handler, status, {"error": message})


def find_slot(room, player_id):
    for slot in ("p1", "p2"):
        player = room["players"].get(slot)
        if player and player["playerId"] == player_id:
            return slot
    return None


def sanitize_loadout(value):
    if not isinstance(value, list):
        return []
    return [str(item)[:32] for item in value[:2] if isinstance(item, str)]


def sanitize_hero_ids(value, fallback):
    if not isinstance(value, list):
        return [fallback, "priest"]
    heroes = [str(item)[:48] for item in value[:2] if isinstance(item, str) and item]
    while len(heroes) < 2:
        heroes.append("priest" if heroes else fallback)
    return heroes


def sanitize_room_blob(value):
    return value if isinstance(value, dict) else None


def validate_tactical_plan(plan, phase):
    if not isinstance(plan, dict) or plan.get("phase") != phase:
        return "计划阶段不匹配。"
    team_plans = plan.get("teamPlans")
    if isinstance(team_plans, list):
        if len(team_plans) > 2:
            return "小队计划数量无效。"
        for item in team_plans:
            if not isinstance(item, dict):
                return "小队计划格式无效。"
            if phase == "movement":
                path = item.get("path", [])
                if not isinstance(path, list) or len(path) > 1:
                    return "移动计划无效。"
                for tile in path:
                    if not isinstance(tile, dict) or not isinstance(tile.get("row"), int) or not isinstance(tile.get("col"), int):
                        return "移动坐标无效。"
            elif phase == "action":
                if not isinstance(item.get("actionId"), str) or not item["actionId"]:
                    return "行动计划缺少动作。"
        return None
    if phase == "movement":
        path = plan.get("path", [])
        if not isinstance(path, list) or len(path) > 1:
            return "移动计划无效。"
        for tile in path:
            if not isinstance(tile, dict) or not isinstance(tile.get("row"), int) or not isinstance(tile.get("col"), int):
                return "移动坐标无效。"
        return None
    if phase == "action":
        if not isinstance(plan.get("actionId"), str) or not plan["actionId"]:
            return "行动计划缺少动作。"
        return None
    return "未知计划阶段。"


def public_room(room, player_id=None):
    submitted = {
        "p1": bool(room["choices"].get("p1")),
        "p2": bool(room["choices"].get("p2")),
    }
    return {
        "code": room["code"],
        "round": room["round"],
        "mode": room.get("mode", "legacy"),
        "phase": room.get("phase", "action"),
        "players": room["players"],
        "mapConfig": room.get("mapConfig"),
        "spawns": room.get("spawns"),
        "scoringRules": room.get("scoringRules"),
        "submitted": submitted,
        "result": room["result"],
        "slot": find_slot(room, player_id) if player_id else None,
    }


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        json_response(self, 200, {})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/rooms/"):
            self.get_room(parsed)
            return
        self.serve_file(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/rooms":
            self.create_room()
            return
        parts = parsed.path.strip("/").split("/")
        if len(parts) == 3 and parts[:2] == ["api", "rooms"]:
            error(self, 404, "未知房间接口。")
            return
        if len(parts) == 4 and parts[:2] == ["api", "rooms"] and parts[3] == "join":
            self.join_room(parts[2].upper())
            return
        if len(parts) == 4 and parts[:2] == ["api", "rooms"] and parts[3] == "action":
            self.submit_action(parts[2].upper())
            return
        if len(parts) == 4 and parts[:2] == ["api", "rooms"] and parts[3] == "advance":
            self.advance_room(parts[2].upper())
            return
        error(self, 404, "未知接口。")

    def create_room(self):
        try:
            data = read_json(self)
            hero_id = data.get("heroId")
            mode = data.get("mode", "legacy")
            player_name = str(data.get("playerName") or "玩家")[:16]
            loadout = sanitize_loadout(data.get("pharmacistLoadout"))
            if not hero_id:
                error(self, 400, "缺少英雄。")
                return
            if mode not in ("legacy", "tactical", "tactical-team"):
                error(self, 400, "未知房间模式。")
                return
            hero_ids = sanitize_hero_ids(data.get("heroIds"), str(hero_id))
            with LOCK:
                code = new_code()
                player_id = secrets.token_urlsafe(12)
                ROOMS[code] = {
                    "code": code,
                    "round": 1,
                    "mode": mode,
                    "phase": "movement" if mode in ("tactical", "tactical-team") else "action",
                    "players": {
                        "p1": {"playerId": player_id, "heroId": hero_id, "heroIds": hero_ids, "name": player_name, "pharmacistLoadout": loadout},
                        "p2": None,
                    },
                    "mapConfig": sanitize_room_blob(data.get("mapConfig")),
                    "spawns": sanitize_room_blob(data.get("spawns")),
                    "scoringRules": sanitize_room_blob(data.get("scoringRules")),
                    "choices": {},
                    "result": None,
                    "acks": set(),
                }
            json_response(self, 200, {"code": code, "playerId": player_id, "slot": "p1"})
        except Exception as exc:
            error(self, 400, str(exc))

    def join_room(self, code):
        try:
            data = read_json(self)
            hero_id = data.get("heroId")
            player_name = str(data.get("playerName") or "玩家")[:16]
            loadout = sanitize_loadout(data.get("pharmacistLoadout"))
            if not hero_id:
                error(self, 400, "缺少英雄。")
                return
            hero_ids = sanitize_hero_ids(data.get("heroIds"), str(hero_id))
            with LOCK:
                room = ROOMS.get(code)
                if not room:
                    error(self, 404, "房间不存在。")
                    return
                if room["players"]["p2"]:
                    error(self, 409, "房间已满。")
                    return
                player_id = secrets.token_urlsafe(12)
                room["players"]["p2"] = {"playerId": player_id, "heroId": hero_id, "heroIds": hero_ids, "name": player_name, "pharmacistLoadout": loadout}
            json_response(self, 200, {"code": code, "playerId": player_id, "slot": "p2"})
        except Exception as exc:
            error(self, 400, str(exc))

    def get_room(self, parsed):
        parts = parsed.path.strip("/").split("/")
        if len(parts) != 3:
            error(self, 404, "未知房间。")
            return
        code = parts[2].upper()
        player_id = parse_qs(parsed.query).get("playerId", [""])[0]
        with LOCK:
            room = ROOMS.get(code)
            if not room:
                error(self, 404, "房间不存在。")
                return
            if player_id and not find_slot(room, player_id):
                error(self, 403, "玩家身份不属于这个房间。")
                return
            payload = public_room(room, player_id)
        json_response(self, 200, payload)

    def submit_action(self, code):
        try:
            data = read_json(self)
            player_id = data.get("playerId")
            round_no = data.get("round")
            action_id = data.get("actionId")
            plan = data.get("plan")
            if not player_id:
                error(self, 400, "缺少玩家身份。")
                return
            with LOCK:
                room = ROOMS.get(code)
                if not room:
                    error(self, 404, "房间不存在。")
                    return
                slot = find_slot(room, player_id)
                if not slot:
                    error(self, 403, "玩家身份不属于这个房间。")
                    return
                if not room["players"]["p1"] or not room["players"]["p2"]:
                    error(self, 409, "还在等待对手加入。")
                    return
                if round_no != room["round"]:
                    error(self, 409, "回合不同步，请刷新。")
                    return
                if room["result"]:
                    json_response(self, 200, public_room(room, player_id))
                    return
                if room.get("mode") in ("tactical", "tactical-team"):
                    plan_error = validate_tactical_plan(plan, room.get("phase"))
                    if plan_error:
                        error(self, 400, plan_error)
                        return
                    room["choices"][slot] = plan
                else:
                    if not action_id:
                        error(self, 400, "缺少动作。")
                        return
                    room["choices"][slot] = action_id
                if room["choices"].get("p1") and room["choices"].get("p2"):
                    if room.get("mode") in ("tactical", "tactical-team"):
                        room["result"] = {
                            "round": room["round"],
                            "phase": room["phase"],
                            "plans": {
                                "p1": room["choices"]["p1"],
                                "p2": room["choices"]["p2"],
                            },
                        }
                    else:
                        room["result"] = {
                            "round": room["round"],
                            "actions": {
                                "p1": room["choices"]["p1"],
                                "p2": room["choices"]["p2"],
                            },
                        }
                    room["acks"] = set()
                payload = public_room(room, player_id)
            json_response(self, 200, payload)
        except Exception as exc:
            error(self, 400, str(exc))

    def advance_room(self, code):
        try:
            data = read_json(self)
            player_id = data.get("playerId")
            round_no = data.get("round")
            with LOCK:
                room = ROOMS.get(code)
                if not room:
                    error(self, 404, "房间不存在。")
                    return
                slot = find_slot(room, player_id)
                if not slot:
                    error(self, 403, "玩家身份不属于这个房间。")
                    return
                if room["result"] and round_no == room["result"]["round"]:
                    room["acks"].add(slot)
                    active_slots = {key for key, value in room["players"].items() if value}
                    if active_slots and room["acks"] >= active_slots:
                        if room.get("mode") in ("tactical", "tactical-team") and room.get("phase") == "movement":
                            room["phase"] = "action"
                        else:
                            room["round"] += 1
                            if room.get("mode") in ("tactical", "tactical-team"):
                                room["phase"] = "movement"
                        room["choices"] = {}
                        room["result"] = None
                        room["acks"] = set()
                payload = public_room(room, player_id)
            json_response(self, 200, payload)
        except Exception as exc:
            error(self, 400, str(exc))

    def serve_file(self, request_path):
        relative = request_path.lstrip("/") or "index.html"
        target = (ROOT / relative).resolve()
        if ROOT not in target.parents and target != ROOT:
            self.send_error(403)
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        body = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8125"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving Clap Duel rooms at http://{host}:{port}/")
    server.serve_forever()
