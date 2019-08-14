const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const {prisma} = require('./generated/prisma-client');

const fetchResultFromDraw = async (drawNum) => {
    console.log('Draw Number ' + drawNum);
    var drawContent = null;

    await axios.get('http://127.0.0.1:8080/sample.txt')
        .then( resp => {
            drawContent  = resp.data;
        })
        .catch(err => {
            console.error('Cannot load remote site ' + err);
        })

    return drawContent;
};



const parsePageContent = async(content) => {
    console.log('Parsing content ... ');
    const $ = cheerio.load(content);

    var resultObj = {};
    var resultArray = [];

    // Get draw date
    let drawDate = $('td.drawdate').html();
    drawDate = drawDate.substr(0 , drawDate.length-5);
    let drawDateMoment = moment(drawDate , 'DD MMM YYYY');
    //console.log('Draw Date : ' + drawDateMoment.format('DD/MM/YYYY'));
    resultObj['drawdate'] = drawDateMoment;

    // Get  all results
    let results = $('td.results4D');
    await results.each( function(index) {
       resultArray.push($(this).html());
    });

    resultObj['resultarray'] = resultArray;

    return resultObj;
};

/*
fetchResultFromDraw(1000)
    .then(pageContent => {
        parsePageContent(pageContent)
            .then (resultArray => {
                console.log("Results : " + resultArray.length);
            });
    });
    */

// Main function, its async so we can use await

async function main(){
    console.log('Fetching results ...');
    var results = await fetchResultFromDraw(1000);
    var resultObj = await parsePageContent(results);

    const insertedResult = await prisma.createResult({
        drawnumber: 1000,
        drawdate: resultObj['drawdate'],
        first:
    })
}

main().catch(err => console.err('Error encountered while starting : ' + err));
