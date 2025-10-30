## NextBank

A modern web experience for exploring a fictional digital bank.

### What you can do

- View an overview dashboard with balances and cards
- Browse and navigate a calendar of schedules
- Explore sample stock charts and movements
- Try a simple login experience

This project is intended for demos and learning. It is not connected to real banking services.

### Requirements

- Node.js 18+
- npm 9+

### Quick start

1) Install dependencies

```bash
npm install
```

2) Serve the site locally

Use any static server to open the site from the `public/` folder. For example:

```bash
npx http-server public -p 5173 -c-1
```

3) (Optional) Enable API proxy

If your demo needs outbound requests, start the proxy service:

```bash
npm run proxy
```

By default the proxy listens on port 3000; you can change it with the `PORT` environment variable.

### Using the app

- Open your local server URL in the browser (e.g., `http://localhost:5173`).
- Navigate between sections (Dashboard, Calendar, Stocks) to explore the experience.
- All content is sample data designed to showcase interactions and UI.

### Accessibility & compatibility

The UI aims to be usable on modern desktop browsers. For the best experience, use a recent version of Chrome, Edge, Firefox, or Safari.

### Troubleshooting

- If the page does not load, ensure your static server is serving the `public/` folder.
- If requests fail in demos that fetch data, start the proxy service and retry.

### License

ISC


