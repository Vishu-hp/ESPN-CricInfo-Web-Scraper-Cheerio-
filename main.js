const request = require("request");
const cheerio = require("cheerio");
const AllMatchesObj = require("./AllMatch");
const fs = require("fs");
const path = require("path");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"; // home page

let iplPath = path.join(__dirname,"ipl");

dirCreator(iplPath);
// console.log("Before");
request(url,cb);

function cb(err,response,html){
    if(err){
        console.log(err);
    }
    else{
        extractLink(html);
    }
}

function extractLink(html){
    let $ = cheerio.load(html);
    let allResults = $(".ds-block .ds-inline-flex.ds-items-center.ds-leading-none");
    let allResultsURL = $(allResults[10]).find("a").attr("href");
    allResultsURL = "https://www.espncricinfo.com"+allResultsURL;
    // console.log(allResultsURL);
    AllMatchesObj.getAllMatchesLink(allResultsURL);
}

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}