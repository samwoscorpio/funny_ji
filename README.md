# Clap Duel

Static browser game with optional 1v1 room-code mode.

## Local 1v1 rooms

The room-code mode needs the small local server because GitHub Pages can only host static files.

```bash
python3 server.py
```

Then open `http://127.0.0.1:8125/`.

For LAN testing, start it with `HOST=0.0.0.0 python3 server.py`, then open the computer's LAN address from the other device.

## Cloud 1v1 deployment

GitHub Pages can still host the single-player/static version, but it cannot run the room server. For online 1v1, deploy this whole folder as a Web Service.

### Render

1. Push all files in this folder to GitHub, including `server.py`, `render.yaml`, and `requirements.txt`.
2. Open Render, choose New > Blueprint, and connect the GitHub repository.
3. Render will read `render.yaml` and run:

```bash
HOST=0.0.0.0 python3 server.py
```

4. Open the Render service URL. Share that URL with friends.

The free Render plan may sleep after inactivity, so the first visit can take a little longer.

### Docker platforms

Use the included `Dockerfile` on platforms such as Railway, Fly.io, or any VPS that can run Docker.

The service must expose the port from the `PORT` environment variable. The app already reads `PORT`, so most platforms will work without code changes.

## GitHub Pages static version

1. Create a new public GitHub repository.
2. Upload `index.html`, `styles.css`, and `game.js` to the repository root.
3. In GitHub, open Settings > Pages.
4. Choose "Deploy from a branch", then select `main` and `/root`.
5. Open the published Pages URL.
