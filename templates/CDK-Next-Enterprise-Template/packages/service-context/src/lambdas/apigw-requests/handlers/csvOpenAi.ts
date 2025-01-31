import { APIGatewayProxyHandler } from 'aws-lambda';
import { saveAnalysisResultToDatabase } from '../repository/saveAnalysisResultToDatabase';
import OpenAI from 'openai';
import { parse } from 'csv-parse/sync';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const uploadCsvHandler: APIGatewayProxyHandler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const jobId = event.headers['x-job-id'];
  const userId = event.headers['x-user-id'];

  console.log('Job ID:', jobId, 'User ID:', userId);

  const fileContent = event.body;

  // Parse the CSV data
  const records = parse(fileContent, {
    columns: true, // Assuming the CSV has headers
    skip_empty_lines: true,
  });

  console.log('Parsed records:', records);

  // Prepare to collect analysis results
  const analysisResults = [];

  for (const record of records) {
    const feedbackText = record.feedback || record.Feedback || record.comment || record.Comment;

    if (!feedbackText) {
      console.warn('No feedback text found in record:', record);
      continue;
    }

    // Define the function schema for OpenAI
    const functions = [
      {
        name: 'analyze_feedback',
        description: 'Analyze customer feedback to determine sentiment, themes, and recommendations',
        parameters: {
          type: 'object',
          properties: {
            sentiment: { type: 'string', enum: ['Positive', 'Neutral', 'Negative'] },
            themes: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
          required: ['sentiment', 'themes'],
        },
      },
    ];

    // Create the prompt
    // Create the prompt
    const prompt = `
You are an AI assistant that analyzes customer feedback. For the following feedback, determine the sentiment, extract key themes, and provide actionable recommendations.

Feedback: "${feedbackText}"
`;

    try {
      // Call OpenAI's API with function calling
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Model that supports function calling
        messages: [{ role: 'user', content: prompt }],
        functions: functions,
        function_call: { name: 'analyze_feedback' },
      });

      const functionResponse = response.choices[0].message?.function_call;

      if (functionResponse) {
        const analysisResult = JSON.parse(functionResponse.arguments);
        analysisResults.push({
          feedbackText,
          ...analysisResult,
        });
      } else {
        console.warn('No function response for feedback:', feedbackText);
      }
    } catch (error) {
      console.error('Error processing feedback:', feedbackText, error);
      // Optionally, handle errors or continue processing other entries
    }
  }

  // Log the analysis results
  console.log('Analysis results:', analysisResults);

  // Store the results in your database
  await saveAnalysisResultToDatabase({ jobId, userId, results: analysisResults });

  return {
    statusCode: 202,
    body: JSON.stringify({ message: 'Processing started.', jobId }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust as needed
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };
};
