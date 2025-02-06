// main.ts
import { App, Fn } from 'aws-cdk-lib';
import { TemplateFrontDoorStack } from './TemplateFrontDoorStack';

const app = new App();

// Create API Stack with dependencies
new TemplateFrontDoorStack(app, 'TemplateFrontDoorStack', {
  apigwLambda: Fn.importValue('ContextService-ApigwHandlerOutput'),
});




