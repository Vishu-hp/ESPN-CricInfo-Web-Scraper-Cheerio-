const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

// let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard"; 

// console.log("Before");

function processScorecard(url){
    request(url, cb);

}

function cb(err, response, html) {
    if (err) {
        console.log(err);
    }
    else {
        extractScorecard(html);
    }
}

function extractScorecard(html){
    let $ = cheerio.load(html);
    // ipl 
    // team 
    //     player 
    //         runs balls fours sixes sr opponent venue date  result

    // venue and date -> .ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid
    //result -> .ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title

    let descElem = $(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");
    let result = $(".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title");
    let strArr = descElem.text().split(",");
    let venue = strArr[1].trim();
    let date = strArr[2].trim() + " , " +strArr[3].trim();
    let resultText = result.text();
    // console.log(venue);
    // console.log(date);
    // console.log(resultText);

    let innings = $(".ds-bg-fill-content-prime.ds-rounded-lg");
    // let htmlStr = "";
    for(let i=0;i<innings.length;i++){
        // htmlStr += $(innings[i]).html();

        // team opponent
        let teamName = $(innings[i]).find(".ds-text-tight-s.ds-font-bold.ds-uppercase").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let oppIdx = i==0?1:0;
        let oppName = $(innings[oppIdx]).find(".ds-text-tight-s.ds-font-bold.ds-uppercase").text();
        oppName = oppName.split("INNINGS")[0].trim();
        console.log(`${venue} ${date} ${teamName} ${oppName} ${resultText}`);

        let allBatsman = $(innings[i]).find(".ds-w-full.ds-table.ds-table-xs.ds-table-fixed.ci-scorecard-table tbody tr.ds-border-b.ds-border-line.ds-text-tight-s");
        for(let j=0;j<allBatsman.length-1;j++){
            let batsmanCol = $(allBatsman[j]).find("td");
            let batsmanName = $(batsmanCol[0]).find("span");
            batsmanName = $(batsmanName[2]).text().trim();
            // console.log(batsmanName);
            //       Player  runs balls fours sixes sr 
            let runs = $(batsmanCol[2]).text().trim();
            let balls = $(batsmanCol[3]).text().trim();
            let fours = $(batsmanCol[5]).text().trim();
            let sixes = $(batsmanCol[6]).text().trim();
            let sr = $(batsmanCol[7]).text().trim();
            console.log(`${batsmanName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
            processPlayer(teamName,oppName,batsmanName,runs,balls,fours,sixes,sr,venue,date,resultText);
        }
    }    
    // console.log(htmlStr);

}

function processPlayer(teamName, oppName, batsmanName, runs, balls, fours, sixes, sr, venue, date, resultText){
    let teamPath = path.join(__dirname,"ipl",teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath,batsmanName+".xlsx");
    let content = excelReader(filePath,batsmanName);
    let playerObj = {
        teamName, 
        oppName, 
        batsmanName, 
        runs, 
        balls, 
        fours, 
        sixes, 
        sr, 
        venue, 
        date, 
        resultText
    }
    content.push(playerObj);
    excelWriter(filePath,content,batsmanName);
}


function dirCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

function excelWriter(filePath, json, sheetName) {
    // New Worksheet
    let newWB = xlsx.utils.book_new();

    // json data -> excel format convert
    let newWS = xlsx.utils.json_to_sheet(json);

    // newWB, newWS , sheet name
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);

    //filePath
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }

    // worbook get
    let wb = xlsx.readFile(filePath);

    // sheet
    let excelData = wb.Sheets[sheetName];

    //sheet data get
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}


module.exports = {
    ps:processScorecard
}