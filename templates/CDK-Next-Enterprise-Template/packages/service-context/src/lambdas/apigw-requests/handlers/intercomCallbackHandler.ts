// src/lambda/intercomCallbackHandler.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';
import { dynamoDb } from '../../../../../common-utils/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const intercomCallbackHandler: APIGatewayProxyHandler = async (event) => {
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  // You can validate the state parameter for security

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Authorization code not provided.' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://api.intercom.io/auth/eagle/token', {
      client_id: process.env.INTERCOM_CLIENT_ID,
      client_secret: process.env.INTERCOM_CLIENT_SECRET,
      code: code,
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = event.headers['x-user-id'];

    // Store the access token securely in your database
    const params = {
      TableName: 'ContextTable',
      Item: {
        PK: `USER#${userId}`,
        SK: 'INTERCOM#TOKEN',
        AccessToken: accessToken,
        CreatedAt: new Date().toISOString(),
      },
    };

    await dynamoDb.send(new PutCommand(params));

    // Redirect the user back to the application
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.APP_URL}/dashboard?connected=intercom`,
        'Content-Type': 'text/html',
      },
      body: '',
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
