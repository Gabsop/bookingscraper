import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export default async function scrape(checkin, checkout, quartos, adultos, hotel) {
  if (!checkin || !checkout || !quartos || !adultos || !hotel) {
    throw new Error("Missing required parameters");
  }

  try {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: true,
      // args: ['--start-maximized']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1600 });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    const url = `https://www.booking.com/searchresults.pt-br.html?label=gen173nr-1DCAEoggI46AdIM1gEaCCIAQGYAS24ARfIARXYAQPoAQGIAgGoAgO4ApivspYGwAIB0gIkZmQxNzkwOGYtZDQ1ZS00N2JlLTkwNDYtZWEwNGQzNjhiZjQx2AIE4AIB&sid=3ae7520e20e7f5ecc6f0df18e53e7fa6&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.pt-br.html%3Flabel%3Dgen173nr-1DCAEoggI46AdIM1gEaCCIAQGYAS24ARfIARXYAQPoAQGIAgGoAgO4ApivspYGwAIB0gIkZmQxNzkwOGYtZDQ1ZS00N2JlLTkwNDYtZWEwNGQzNjhiZjQx2AIE4AIB%26sid%3D3ae7520e20e7f5ecc6f0df18e53e7fa6%26sb_price_type%3Dtotal%26%26&ss=Pipa&is_ski_area=0&ssne=Pipa&ss=Pipa&dest_id=-662045&dest_type=city&checkin_year=${checkin.getFullYear()}&checkin_month=${checkin.getMonth()}&checkin_monthday=${checkin.getDate()}&checkout_year=${checkout.getFullYear()}&checkout_month=${checkout.getMonth()}&checkout_monthday=${checkout.getDate()}&group_adults=${adultos}&group_children=0&no_rooms=${quartos}&b_h4u_keep_filters=&from_sf=1`;
    const tableXPATH = "//*[@id='search_results_table']";
    const inputSelector = ".ce45093752";
    const buttonSelector = "#left_col_wrapper > div:nth-child(1) > div > div > form > div > div:nth-child(6) > div > button";
    const optionSelector = "#left_col_wrapper > div:nth-child(1) > div > div > form > div > div:nth-child(2) > div > div.ab090fee6e.cc6f7f2b89 > div.a7631de79e > ul > li:nth-child(1) > div";

    console.log("Starting scraping for", hotel);

    await page.goto(url);
    await page.waitForSelector(inputSelector, { timeout: 90000 });
    await page.waitForSelector(buttonSelector, { timeout: 90000 });

    await page.click(inputSelector, { clickCount: 3 });
    await page.type(inputSelector, hotel);
    await page.waitForSelector(optionSelector, { timeout: 90000 });
    await page.click(optionSelector);

    await page.click(buttonSelector);

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForXPath(tableXPATH, { timeout: 90000 });


    const name = await page.$eval(".fcab3ed991.a23c043802", (el) => el.innerHTML);

    const price = await page.$eval(".fcab3ed991.bd73d13072", (el) => el.innerHTML);

    const description = await page.$eval(".df597226dd", (el) => el.innerHTML);

    const rate = await page.$eval(".b5cd09854e.d10a6220b4", (el) => el.innerHTML);

    const breakfast = await page.$eval(".e05969d63d", (el) => el.innerHTML);

    const beach = await page.$eval(".acb0d5ead1", (el) => el.innerHTML);

    const center = await page.$eval("[data-testid='distance']", (el) => el.innerHTML);

    const link = await page.$eval(".e13098a59f", (el) => el.href);

    const reg = /&nbsp;/gm;
    let result = {
      Nome: name.replace(reg, ""),
      Descrição: description.replace(reg, ""),
      Valor: parseFloat(
        price.replace(reg, "").replace("R$", "").replace(".", "")
      ),
      Nota: parseFloat(rate.replace(reg, "").replace(",", ".")),
      "Café da Manhã?": breakfast ? "Sim" : "Não",
      "Distância até a Praia": beach.replace(reg, ""),
      "Distância até o Centro": center.replace(reg, ""),
      Link: link.replace(reg, ""),
    };

    await browser.close();
    return result;

  } catch (error) {
    console.error(error);
  }
}
