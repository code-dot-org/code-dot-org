const puppeteer = require("puppeteer");
const fs = require('fs');

(async () => {
  const argv = require("yargs")
    .option("url", {
      alias: "u",
      describe: "URL to scrape"
    })
    .option("outputPath", {
      alias: "o",
      describe: "path where generated HTML file should be created"
    })
    .demandOption("url", "Please provide url argument")
    .demandOption("outputPath", "Please provide outputPath argument")
    .epilogue(
      "Make sure to specify either HTML or URL as source; otherwise, you'll get a blank page."
    )
    .help().argv;

  const browser = await puppeteer.launch({
    // pass the "unlimited storage" flag so we don't crash when printing very
    // large pages.
    // pass the "full memory crash report" flag because I'm still not 100% sure
    // that unlimited storage will fix the crash we've been seeing
    // occasionally, and I want more info if we do get another crash.
    args: ["--unlimited-storage", "--full-memory-crash-report"]
  });
  const page = await browser.newPage();
  const pageOptions = {
    waitUntil: ["domcontentloaded", "networkidle2"]
  };
  await page.goto(argv.url, pageOptions);

  const html = await page.content();
  fs.writeFileSync(argv.outputPath, html);

  await browser.close();
})();
