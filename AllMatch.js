const request = require("request");
const cheerio = require("cheerio");
const scorecardObj = require("./scorecard");

function getAllMatchesLink(url){
    request(url,cb);

    function cb(err,response,html){
        if(err){
            console.log(err);
        }
        else{
            extractAllLinks(html);
        }
    }
}

function extractAllLinks(html){
    let $ = cheerio.load(html);
    let allMatches = $(".ds-flex.ds-mx-4.ds-pt-2.ds-pb-3.ds-space-x-4 .ds-inline-flex.ds-items-center.ds-leading-none");
    for (let i = 0; i < allMatches.length; i++) {
        let fieldName = $(allMatches[i]).find("span");
        if (fieldName.text() == "Scorecard") {
            let matchURL = $(allMatches[i]).find("a").attr("href");
            matchURL = "https://www.espncricinfo.com" + matchURL;
            // console.log(matchURL);
            scorecardObj.ps(matchURL);
        }
    }
}




module.exports = {
    getAllMatchesLink:getAllMatchesLink
}