// src/lambda/fetchIntercomDataHandler.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { dynamoDb } from '../../../../../common-utils/dynamoClient';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export const fetchIntercomDataHandler: APIGatewayProxyHandler = async (
  event,
) => {
  const userId = event.headers['x-user-id'];

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'User ID not provided in headers.' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    // Retrieve access token from DynamoDB
    const tokenParams = {
      TableName: 'ContextTable',
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'INTERCOM#TOKEN',
      },
    };

    const tokenResult = await dynamoDb.send(new QueryCommand(tokenParams));

    if (!tokenResult.Items || tokenResult.Items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Intercom not connected.' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const accessToken = tokenResult.Items[0].AccessToken;

    // Fetch conversations from Intercom
    const response = await axios.get('https://api.intercom.io/conversations', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const conversations = response.data.conversations;

    // Process and analyze each conversation
    const analysisResults = [];

    for (const conversation of conversations) {
      const feedbackText = conversation.conversation_message?.body;

      if (!feedbackText) {
        continue;
      }

      // Use OpenAI API to analyze feedbackText
      // ... (similar to your uploadCsvHandler logic)

      // For brevity, we'll assume you have a function analyzeFeedback

      const analyzeFeedback = (a) => {
        return {};
      };
      const analysisResult = await analyzeFeedback(feedbackText);

      analysisResults.push({
        feedbackText,
        ...analysisResult,
      });
    }

    // Store the results in DynamoDB
    const jobId = uuidv4();
    const params = {
      TableName: 'ContextTable',
      Item: {
        PK: `USER#${userId}`,
        SK: `JOB#${jobId}`,
        Results: analysisResults,
        CreatedAt: new Date().toISOString(),
        Source: 'Intercom',
      },
    };

    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Intercom data fetched and analyzed successfully.',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error fetching Intercom data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
