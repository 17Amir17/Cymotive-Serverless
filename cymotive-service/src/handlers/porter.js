import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const S3 = new AWS.S3();

async function uploadToS3(data){
    const params = {
        Body: JSON.stringify(data),
        ContentType: 'application/json',
        Bucket: process.env.BUCKET_NAME,
        Key: `report-${uuidv4()}`
    }
    return await new Promise((resolve, rej) => {
        S3.putObject(params, (err, res) => {
            if(err) rej(err);
            else resolve(res);
        })
    })
}

function getPayload(event){
    try {
        const payload = JSON.parse(event.body);
        if(payload === undefined) throw new Error();
        return payload;
    } catch (error) {
        throw 'Invalid Request';
    }
}

async function porter(event, context){
    try {
        const payload = getPayload(event);
        console.log(uuidv4);
        await uploadToS3(payload.report);
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
}

export const handler = porter;