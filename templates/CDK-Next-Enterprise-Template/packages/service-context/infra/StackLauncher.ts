import { App } from 'aws-cdk-lib';
import { ServiceContextStack } from './contextServiceStack';
import config from '../envConstants';
const app = new App();

new ServiceContextStack(app, 'ServiceContextStack', {
  STRIPE_SECRET_KEY: config.STRIPE_SECRET_KEY,
  OPENAI_KEY: config.OPENAI_KEY,
  COINMARKETCAP_API_KEY: config.COINMARKETCAP_API_KEY,
});

app.synth();
