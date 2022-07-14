import scrape from "./src/scrape.js";
import XLSX from "xlsx";

const checkin = new Date(2022, 8, 14);
const checkout = new Date(2022, 8, 16);
const quartos = "1";
const adultos = "1";
const hotels = [
  "Lagarto Na Banana Hostel",
  "Hostel Casa de Jack",
  "Casa Kokoro",
];
let results = [];

try {
  for (const hotel of hotels) {
    let result = await scrape(checkin, checkout, quartos, adultos, hotel);
    results.push(result);
  }
} catch (error) {
  throw error;
}

console.log(Object.assign({}, results));

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
