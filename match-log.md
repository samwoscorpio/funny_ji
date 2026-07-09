# 好玩的Ji 对战日志

本文件记录对战日志的数据格式和人工备份模板。当前本地测试版会把历史对局写入浏览器 `localStorage`，键名为 `clapDuel.matchHistory.v1`；不同玩家通过“玩家昵称”区分。

## 记录字段

- `id`: 对局记录 ID。
- `playerName`: 当前用户昵称。
- `finishedAt`: 对局结束时间，ISO 时间字符串。
- `mode`: 对局模式，可能为 `cpu`、`online`、`melee`。
- `modeLabel`: 用于界面显示的模式名。
- `playerHero`: 当前用户使用的英雄。
- `opponentHeroes`: 对手英雄列表。混战中会包含多个对手。
- `result`: 当前用户视角的结果，可能为 `win`、`loss`、`draw`。
- `rounds`: 对局结束时的回合数。

## 示例

```json
{
  "id": "1783600000000-ab12cd",
  "playerName": "Sam",
  "finishedAt": "2026-07-09T06:40:00.000Z",
  "mode": "cpu",
  "modeLabel": "人机对战",
  "playerHero": "刺客",
  "opponentHeroes": ["电脑：牧师"],
  "result": "win",
  "rounds": 5
}
```

## 人工备份区

需要手动备份时，可以从浏览器开发者工具复制 `localStorage` 中的 `clapDuel.matchHistory.v1` 内容，粘贴到这里。
