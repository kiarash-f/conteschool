const puppeteer = require('puppeteer');

let page;
let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.goto('http://localhost:5173');
});

afterEach(async () => {
  await browser.close();
});

test('make sure logo exist', async () => {
  const text = await page.$eval('.mb-6', (el) => el.textContent);

  expect(text).toEqual('دوره های پرطرفدار');
});

test('when sighned in log out button apewar',async()=>{
const id ='6824b7c2c411611c670366d4';
const buffer = require('safe-buffer').buffer;
});