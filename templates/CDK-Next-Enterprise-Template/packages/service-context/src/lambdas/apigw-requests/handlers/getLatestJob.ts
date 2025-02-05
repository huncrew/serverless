import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDb } from '../../../../../common-utils/dynamoClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export const getLatestJobHandler: APIGatewayProxyHandler = async (event) => {
  console.log('calling in latestJobHandler');
  const userId = event.headers['x-user-id'];

  console.log('userId', userId);

  try {
    const params = {
      TableName: 'ContextTable',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skPrefix': 'JOB#',
      },
      ScanIndexForward: false, // Sort descending to get the latest job first
      Limit: 1,
    };

    const result = await dynamoDb.send(new QueryCommand(params));

    console.log('result', result);

    if (result.Items && result.Items.length > 0) {
      const latestJob = result.Items[0];
      return {
        statusCode: 200,
        body: JSON.stringify(latestJob),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No jobs found for this user.' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching latest job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
