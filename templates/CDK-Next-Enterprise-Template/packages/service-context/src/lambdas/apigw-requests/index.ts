import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, ALBEvent, ALBResult } from 'aws-lambda';
import middy from '@middy/core';
import httpRouterHandler, { Route } from '@middy/http-router';
import jsonBodyParser from '@middy/http-json-body-parser';
import { cryptoHandler } from './handlers/crypto';
import { stripeHandler } from './handlers/stripe';
import { uploadCsvHandler } from './handlers/csvOpenAi';
import { getJobsHandler } from './handlers/getJobs';
import { getLatestJobHandler } from './handlers/getLatestJob';
import { getAggregatedResultsHandler } from './handlers/aggregateJobs';
import { intercomCallbackHandler } from './handlers/intercomCallbackHandler';
// import { uploadCsvHandler } from './handlers/uploadCsvHandler';
// import { retrieveAnalysisHandler } from './handlers/retrieveAnalysisHandler';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Define routes
const routes: Route<APIGatewayProxyEvent | ALBEvent, APIGatewayProxyResult | ALBResult>[] = [
  {
    method: 'GET',
    path: '/crypto',
    handler: cryptoHandler,
  },
  {
    method: 'POST',
    path: '/stripe-checkout',
    handler: stripeHandler,
  },
  {
    method: 'POST',
    path: '/upload-csv',
    handler: uploadCsvHandler,
  },
  {
    method: 'GET',
    path: '/jobs',
    handler: getJobsHandler,
  },
  {
    method: 'GET',
    path: '/latest-job',
    handler: getLatestJobHandler,
  },
  {
    method: 'GET',
    path: '/aggregated-results',
    handler: getAggregatedResultsHandler,
  },
];

// Apply middleware and router
export const handler = middy()
  .handler(httpRouterHandler(routes))
  // .use(jsonBodyParser());
