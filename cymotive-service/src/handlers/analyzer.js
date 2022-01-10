const AWS = require("aws-sdk");

const NUMBER_OF_REPORTS = "/numberOfReports";
const NUMBER_OF_VEHICLES = "/numberOfVehicles";
const NUMBER_OF_ANOMALIES = "/numberOfAnomalies";

const DynamoDB = new AWS.DynamoDB.DocumentClient();

function hasAnomaly(signalObject) {
  return (
    signalObject.sum < signalObject.acceptableMinValue ||
    signalObject.sum > signalObject.acceptableMaxValue
  );
}

async function getNumberOfAnomalies() {
  let anomalies = 0;
  const params = {
    TableName: process.env.TABLE_NAME,
  };
  const items = await DynamoDB.scan(params).promise();
  for (const item of items.Items) {
    anomalies +=
      hasAnomaly(item.signalsPerMinute.infotainment) +
      hasAnomaly(item.signalsPerMinute.windows) +
      hasAnomaly(item.signalsPerMinute.airBag);
  }
  return { count: anomalies };
}

async function getNumberOfVehicles() {
  return await getCount();
}

async function getNumberOfReports() {
  return await getCount();
}

async function getCount() {
  const params = {
    TableName: process.env.TABLE_NAME,
    Select: "COUNT",
  };
  return { count: (await DynamoDB.scan(params).promise()).Count };
}

function createResponse(body) {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
}

async function analyzer(event, context) {
  console.log(event.path);
  switch (event.path) {
    case NUMBER_OF_ANOMALIES:
      return createResponse(await getNumberOfAnomalies());
    case NUMBER_OF_VEHICLES:
      return createResponse(await getNumberOfVehicles());
    case NUMBER_OF_REPORTS:
      return createResponse(await getNumberOfReports());
  }
  return {
    statusCode: 404,
    body: JSON.stringify("Path not found"),
  };
}

export const handler = analyzer;
