// main.ts
import { App, Fn } from 'aws-cdk-lib';
import { AuthStack } from './AuthStack';
import { ApiStack } from './ApiStack';

const app = new App();

// Create Auth Stack
const authStack = new AuthStack(app, 'AuthStack');

// Create API Stack with dependencies
new ApiStack(app, 'ApiStack', {
  apigwLambda: Fn.importValue('ContextService-ApigwHandlerOutput'),
  userPool: authStack.userPool
});