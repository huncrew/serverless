// main.ts
import { App, Fn } from 'aws-cdk-lib';
import { AuthStack } from './AuthStack';
import { TemplateFrontDoorStack } from './ApiStack';

const app = new App();

// Create API Stack with dependencies
new TemplateFrontDoorStack(app, 'TemplateFrontDoorStack', {
  apigwLambda: Fn.importValue('ContextService-ApigwHandlerOutput'),
});
