const axios = require('axios');
const reports = require('./reports.json');

const base_url = 'https://7233um07nb.execute-api.eu-west-1.amazonaws.com/api/'

async function postReport(report){
    axios.post(base_url, {report});
}

reports.forEach(rep => {
    postReport(rep)
})

