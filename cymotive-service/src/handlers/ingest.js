import AWS from 'aws-sdk'

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAddedObject(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    const { Body } = await s3.getObject(params).promise();
    const obj = await JSON.parse(Body.toString());
    return obj;
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
}

async function putObjectInDB(item) {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: item,
  };
  await DynamoDB.put(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  }).promise();
}

async function ingest(event){
  // Event -> Records -> s3
  for (const record of event.Records) {
    const object = await getAddedObject(
      record.s3.bucket.name,
      record.s3.object.key
    );
    await putObjectInDB(object);
    return object;
  }
}

export const handler = ingest;