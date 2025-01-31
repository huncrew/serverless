import { App, Fn } from 'aws-cdk-lib';
import { ApiStack } from './ApiStack';

const app = new App();

// Instantiate other stacks and pass their Lambda ARNs
new ApiStack(app, 'ApiStack', {
  apigwLambda: Fn.importValue('ContextService-ApigwHandlerOutput'),
});
