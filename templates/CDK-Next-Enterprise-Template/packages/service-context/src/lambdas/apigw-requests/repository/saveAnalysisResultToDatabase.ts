import { dynamoDb } from '../../../../../common-utils/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const saveAnalysisResultToDatabase = async ({ jobId, userId, results }) => {
  const params = {
    TableName: 'ContextTable',
    Item: {
      PK: `USER#${userId}`, // Partition Key
      SK: `JOB#${jobId}`,   // Sort Key
      Results: results,     // Store the array of analysis results
      CreatedAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.send(new PutCommand(params));
    console.log(`Successfully saved analysis results for JobId: ${jobId}`);
  } catch (error) {
    console.error('Error saving analysis results to DynamoDB:', error);
    throw new Error('Could not save analysis results to database');
  }
};
