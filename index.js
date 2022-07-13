import scrape from "./src/scrape.js";

const checkin = new Date(2022, 8, 12);
const checkout = new Date(2022, 8, 16);
const quartos = "1";
const adultos = "1";

await scrape(checkin, checkout, quartos, adultos);
