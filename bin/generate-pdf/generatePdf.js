const puppeteer = require("puppeteer");

(async () => {
  const argv = require("yargs")
    .option("url", {
      alias: "u",
      describe: "URL to generate PDF from"
    })
    .option("html", {
      alias: "h",
      describe: "raw HTML to generate PDF from"
    })
    .option("outputPath", {
      alias: "o",
      describe: "path where generated PDF file should be created"
    })
    .conflicts("url", "html")
    .demandOption("outputPath", "Please provide outputPath argument")
    .epilogue(
      "Make sure to specify either HTML or URL as source; otherwise, you'll get a blank page."
    )
    .help().argv;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const pageOptions = {
    waitUntil: ["domcontentloaded", "networkidle2"]
  };

  if (argv.url) {
    await page.goto(argv.url, pageOptions);
  } else if (argv.html) {
    await page.setContent(argv.html, pageOptions);
  }

  await page.pdf({
    path: argv.outputPath,
    format: "Letter",
    margin: {
      top: "0.5in",
      bottom: "0.5in",
      right: "0.5in",
      left: "0.5in"
    }
  });

  await browser.close();
})();
