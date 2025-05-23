import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());

// Serve the frontend HTML at root "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Screenshot endpoint
app.get('/screenshot', async (req, res) => {
  const { url, screenWidth, deviceScaleFactor } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing or invalid URL parameter');
  }

  const width = parseInt(screenWidth) || 1280;
  const scale = parseFloat(deviceScaleFactor) || 2;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width,
      height: 800, // This height doesn't matter when fullPage is true
      deviceScaleFactor: scale,
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshot = await page.screenshot({
      fullPage: true,
    });

    await browser.close();

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename=macbook-style-fullpage.png',
    });
    res.send(screenshot);
  } catch (err) {
    console.error('Screenshot error:', err);
    res.status(500).send('Failed to capture screenshot');
  }
});





app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
