const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment-timezone');
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
/*
async function main(){
    console.log('Fetching results ...');
    var results = await fetchResultFromDraw(1000);
    var resultObj = await parsePageContent(results);
    var resultArray = resultObj['resultarray'];

//http://sgresult.appspot.com/4d/
    console.log('Draw Date : ' + moment(resultObj['drawdate']).format('DD MM YYYY'));

    var starterSet = [];
    for(var i = 3; i < 13 ; i++){
        starterSet.push(resultArray[i]);
    }

    var consolationSet = [];
    for(var i = 13 ; i < 23 ; i++){
        consolationSet.push(resultArray[i]);
    }

    const insertedResult = await prisma.createResult({
        drawnumber: 1000,
        drawdate: resultObj['drawdate'],
        first: resultArray[0],
        second: resultArray[1],
        third: resultArray[2],
        starters: {
           set: starterSet
        },
        consolations: {
            set: consolationSet
        }
    });
    console.log(insertedResult);

}
*/

async function main(){
    var draws = await prisma.results();
    console.log("Draw Date " + draws[0].drawdate);
    //console.log(draws);
    console.log("Converted : " + moment(draws[0].drawdate).tz('Asia/Singapore').format('DD MM YYYY'));
}
main().catch(err => console.error('Error encountered while starting : ' + err));
