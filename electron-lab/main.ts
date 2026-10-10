// TypeScript Electron main for portable measurement (no window shown)
import { app, BrowserWindow } from 'electron';
process.on('uncaughtException', (e) => {
  console.error(`MAIN_ERROR: ${e.name}: ${e.message}`);
  app.exit(1);
});
const t0 = Date.now();
app.whenReady().then(() => {
  const win = new BrowserWindow({ show: false, width: 400, height: 300 });
  win.loadURL('data:text/html,<h1>vanish-lab-ts</h1>');
  win.webContents.on('did-finish-load', () => {
    console.log(`COLD_START_MS=${Date.now() - t0}`);
    console.log(`MAIN_RSS_MB=${Math.round(process.memoryUsage().rss / 1048576)}`);
    setTimeout(() => app.quit(), 1500);
  });
});