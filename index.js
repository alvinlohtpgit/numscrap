const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');

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

    var resultArray = [];

    // Get draw date
    let drawDate = $('td.drawdate').html();
    drawDate = drawDate.substr(0 , drawDate.length-5);
    let drawDateMoment = moment(drawDate , 'DD MMM YYYY');
    //console.log('Draw Date : ' + drawDateMoment.format('DD/MM/YYYY'));

    // Get  all results
    let results = $('td.results4D');
    await results.each( function(index) {
       resultArray.push($(this).html());
    });

    return resultArray;

};

fetchResultFromDraw(1000)
    .then(pageContent => {
        parsePageContent(pageContent)
            .then (resultArray => {
                console.log("Results : " + resultArray.length);
            });
    });