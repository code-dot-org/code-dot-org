const puppeteer = require("puppeteer");

(async () => {
  const argv = require("yargs")
    .option("url", {
      alias: "u",
      describe: "URL to generate PDF from"
    })
    .option("outputPath", {
      alias: "o",
      describe: "path where generated PDF file should be created"
    })
    .demandOption(
      ["url", "outputPath"],
      "Please provide required url and outputPath arguments"
    )
    .help().argv;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(argv.url, { waitUntil: "networkidle2" });
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
