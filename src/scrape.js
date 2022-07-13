import puppeteer from "puppeteer-extra";
import XLSX from "xlsx";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export default async function scrape(checkin, checkout, quartos, adultos) {
  if (!checkin || !checkout || !quartos || !adultos) {
    throw new Error("Missing required parameters");
  }

  try {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--start-maximized", "--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    const url = `https://www.booking.com/searchresults.pt-br.html?label=gen173nr-1DCAEoggI46AdIM1gEaCCIAQGYAS24ARfIARXYAQPoAQGIAgGoAgO4ApivspYGwAIB0gIkZmQxNzkwOGYtZDQ1ZS00N2JlLTkwNDYtZWEwNGQzNjhiZjQx2AIE4AIB&sid=3ae7520e20e7f5ecc6f0df18e53e7fa6&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.pt-br.html%3Flabel%3Dgen173nr-1DCAEoggI46AdIM1gEaCCIAQGYAS24ARfIARXYAQPoAQGIAgGoAgO4ApivspYGwAIB0gIkZmQxNzkwOGYtZDQ1ZS00N2JlLTkwNDYtZWEwNGQzNjhiZjQx2AIE4AIB%26sid%3D3ae7520e20e7f5ecc6f0df18e53e7fa6%26sb_price_type%3Dtotal%26%26&ss=Pipa&is_ski_area=0&ssne=Pipa&ssne_untouched=Pipa&dest_id=-662045&dest_type=city&checkin_year=${checkin.getFullYear()}&checkin_month=${checkin.getMonth()}&checkin_monthday=${checkin.getDate()}&checkout_year=${checkout.getFullYear()}&checkout_month=${checkout.getMonth()}&checkout_monthday=${checkout.getDate()}&group_adults=${adultos}&group_children=0&no_rooms=${quartos}&b_h4u_keep_filters=&from_sf=1`;

    // const pagesXPATH =
    //   "//*[@id='search_results_table']/div[2]/div/div/div/div[7]/div[2]/nav/div/div[2]";

    const tableXPATH = "//*[@id='search_results_table']";

    console.log("Starting scraping...");

    await page.goto(url);
    await page.waitForXPath(tableXPATH, { timeout: 1000 });

    console.log("Table found!");

    // await page.waitForXPath(pagesXPATH, { timeout: 10000 });
    // let pagesHandler = await page.$x(pagesXPATH);
    // let pages = await page.evaluate((el) => el.textContent, pagesHandler[0]);
    // console.log("Pages: ", pages);

    // const regex = /[0-9](?=…)/gm;
    // let pagesAmount = pages.match(regex);
    // console.log("Pages Amount: ", pagesAmount[0]);

    const names = await page.$$eval(".fcab3ed991.a23c043802", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const values = await page.$$eval(".fcab3ed991.bd73d13072", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const description = await page.$$eval(".df597226dd", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    // const layout = await page.$$eval(".cb5ebe3ffb", (el) =>
    //   el.map((ell) => ell.innerHTML)
    // );

    const rates = await page.$$eval(".b5cd09854e.d10a6220b4", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const breakfast = await page.$$eval(".e05969d63d", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const beachDistance = await page.$$eval(".acb0d5ead1", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const centerDistance = await page.$$eval("[data-testid='distance']", (el) =>
      el.map((ell) => ell.innerHTML)
    );

    const link = await page.$$eval(".e13098a59f", (el) =>
      el.map((ell) => ell.href)
    );

    let results = [];

    const reg = /&nbsp;/gm;
    names.forEach((_, idx) =>
      results.push({
        Nome: names[idx].replace(reg, ""),
        Descrição: description[idx].replace(reg, ""),
        Valor: parseFloat(
          values[idx].replace(reg, "").replace("R$", "").replace(".", "")
        ),
        // layout: layout[idx].replace(reg, ""),
        Nota: parseFloat(rates[idx].replace(reg, "").replace(",", ".")),
        "Café da Manhã?": breakfast[idx] ? "Sim" : "Não",
        "Distância até a Praia": beachDistance[idx].replace(reg, ""),
        "Distância até o Centro": centerDistance[idx].replace(reg, ""),
        Link: link[idx].replace(reg, ""),
      })
    );

    await browser.close();
    console.log("Results: ", results);

    const resultsWorkbook = XLSX.utils.book_new();
    const resultsSheet = XLSX.utils.json_to_sheet(results);

    XLSX.utils.book_append_sheet(resultsWorkbook, resultsSheet);
    XLSX.writeFile(
      resultsWorkbook,
      `${
        ("0" + checkin.getDate()).slice(-2) +
        "-" +
        ("0" + checkin.getMonth()).slice(-2) +
        "-" +
        checkin.getFullYear()
      }__${
        ("0" + checkout.getDate()).slice(-2) +
        "-" +
        ("0" + checkout.getMonth()).slice(-2) +
        "-" +
        checkout.getFullYear()
      }.xlsx`
    );
  } catch (error) {
    console.error(error);
  }
}
