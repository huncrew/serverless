import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDb } from '../../../../common-utils/dynamoClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

export const getAggregatedResultsHandler: APIGatewayProxyHandler = async (
  event,
) => {
  const userId = event.headers['x-user-id'];
  const queryParams = event.queryStringParameters || {};
  const startDate = queryParams.startDate;
  const endDate = queryParams.endDate;

  console.log('calling in aggregated results');

  try {
    // Construct the DynamoDB query
    const params: any = {
      TableName: 'ContextTable',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skPrefix': 'JOB#',
      },
    };

    // Optional filtering by date range
    if (startDate || endDate) {
      params.FilterExpression = '';
      params.ExpressionAttributeValues = params.ExpressionAttributeValues || {};

      if (startDate) {
        params.FilterExpression += 'CreatedAt >= :startDate';
        params.ExpressionAttributeValues[':startDate'] = startDate;
      }
      if (endDate) {
        if (startDate) params.FilterExpression += ' AND ';
        params.FilterExpression += 'CreatedAt <= :endDate';
        params.ExpressionAttributeValues[':endDate'] = endDate;
      }
    }

    // Fetch all jobs for the user
    const result = await dynamoDb.send(new QueryCommand(params));

    console.log('calling in aggregated DB ', result);

    const allResults = [];

    // Combine Results from each job
    if (result.Items) {
      result.Items.forEach((item) => {
        if (item.Results && Array.isArray(item.Results)) {
          allResults.push(...item.Results);
        }
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ Results: allResults }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    console.error('Error fetching aggregated results:', error);
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
