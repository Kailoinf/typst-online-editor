import { firefox } from 'playwright';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

let server = null;

function startPreview() {
  return new Promise((resolvePromise, reject) => {
    server = spawn('pnpm', ['preview', '--port', String(PORT), '--host', '0.0.0.0'], {
      cwd: resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timeout = setTimeout(() => {
      reject(new Error('Preview server start timeout'));
    }, 15000);

    server.stdout?.on('data', (data) => {
      if (data.toString().includes('localhost')) {
        clearTimeout(timeout);
        resolvePromise();
      }
    });

    server.stderr?.on('data', (data) => {
      if (data.toString().includes('localhost')) {
        clearTimeout(timeout);
        resolvePromise();
      }
    });

    server.on('error', reject);
  });
}

function stopPreview() {
  if (server) {
    server.kill('SIGTERM');
    server = null;
  }
}

async function run() {
  console.log('> Starting preview server...');
  await startPreview();
  console.log(`> Preview ready at ${BASE}`);

  const errors = [];
  const warnings = [];

  const browser = await firefox.launch({ headless: true });
  let page = null;

  try {
    page = await browser.newPage();

    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    console.log('> Loading page...');
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Wait a moment for React to hydrate
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`> Title: "${title}"`);
    if (!title.includes('Typst')) {
      errors.push(`Wrong title: ${title}`);
    }

    const errorBoundary = await page.$('text=出错了');
    if (errorBoundary) {
      const errorText = await page.textContent('pre');
      errors.push(`ErrorBoundary hit: ${errorText}`);
    } else {
      console.log('> No ErrorBoundary');
    }

    const root = await page.$('#root');
    if (!root) {
      errors.push('#root element missing');
    }

    if (errors.length > 0) {
      console.error(`\nFAIL — ${errors.length} error(s):`);
      errors.forEach((e) => console.error(`  ${e}`));
    } else {
      console.log('\nALL CHECKS PASSED');
    }

    if (warnings.length > 0) {
      console.warn(`\n${warnings.length} warning(s) in console`);
    }
  } catch (err) {
    console.error('Test crashed:', err);
  } finally {
    if (page) await page.close();
    await browser.close();
    await stopPreview();
  }

  if (errors.length > 0) process.exit(1);
}

run();
