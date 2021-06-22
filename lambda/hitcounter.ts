import {DynamoDB, Lambda} from 'aws-sdk'

export const handler = async (event: any) => {
  console.log('request: ', JSON.stringify(event, undefined, 2))

  // Create AWS SDK clients
  const dynamo = new DynamoDB()
  const lambda = new Lambda()

  if(!process.env.HITS_TABLE_NAME || !process.env.DOWNSTREAM_FUNCTION_NAME) {
    throw new Error('missing environment variables HITS_TABLE_NAME or DOWNSTREAM_FUNCTION_NAME')
  }

  // update dynamo entry for "path" with number of hits
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path }},
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1'}}
  }, undefined).promise()

  // calls downstream function to capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }, undefined).promise()

  console.log('downstream response: ', JSON.stringify(resp, undefined, 2))

  // return response to upstream caller
  return JSON.parse(resp.Payload!.toString())
}