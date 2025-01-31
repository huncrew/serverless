import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDb } from '../../../../../common-utils/dynamoClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export const getJobsHandler: APIGatewayProxyHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const userId = event.headers['x-user-id'];

  console.log('userId', userId)

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing userId' }),
    };
  }

  const params = {
    TableName: 'ContextTable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':skPrefix': 'JOB#',
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));

    const jobs = data.Items?.map((item) => ({
      jobId: item.SK.replace('JOB#', ''),
      result: item.Results,
      createdAt: item.CreatedAt,
    })) || [];

    console.log(jobs)

    console.log('job retrieval successful')

    return {
      statusCode: 200,
      body: JSON.stringify(jobs),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // or specific origin
        "Access-Control-Allow-Headers": "Content-Type",      
      },
    };
  } catch (error) {
    console.error('Error retrieving jobs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve jobs' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // or specific origin
        "Access-Control-Allow-Headers": "Content-Type",      
      },
    };
  }
};
