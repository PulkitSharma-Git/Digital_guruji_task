import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Screenshot endpoint
app.get('/screenshot', async (req, res) => {
  const { url, screenWidth, deviceScaleFactor } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing or invalid URL parameter');
  }

  const width = parseInt(screenWidth) || 1280;
  const scale = parseFloat(deviceScaleFactor) || 2;

  try {
    console.log('Chromium path:', puppeteer.executablePath());

    const browser = await puppeteer.launch({
  headless: true,
  executablePath: puppeteer.executablePath(),
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
});


    const page = await browser.newPage();

    await page.setViewport({
      width,
      height: 800,
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
