import * as path from 'path';
import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export interface ServiceContextStackProps extends StackProps {
  STRIPE_SECRET_KEY: string;
  OPENAI_KEY: string;
  COINMARKETCAP_API_KEY: string;
}

export class ServiceContextStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceContextStackProps) {
    super(scope, id, props);

    const lambdasPath = path.join(__dirname, '..', 'lambdas');

    // Create DynamoDB table
    const serviceTable = new Table(this, 'TemplateServiceTable', {
      tableName: 'TemplateTable',
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Create Node.js Lambda for API Gateway integration
    const apigwHandler = new NodejsFunction(this, 'ApigwHandler', {
      entry: `${lambdasPath}/apigw-requests/index.ts`,
      environment: {
        TABLE_NAME: serviceTable.tableName,
        STRIPE_SECRET_KEY: props.STRIPE_SECRET_KEY,
        OPENAI_KEY: props.OPENAI_KEY,
        COINMARKETCAP_API_KEY: props.COINMARKETCAP_API_KEY,
      },
      timeout: Duration.seconds(90),
    });

    // Grant API Gateway permission to invoke the Lambda
    apigwHandler.addPermission('GenerateAIInvokePermission', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*/*/*/*`,
    });

    // Export the Lambda’s ARN for consumption by other stacks
    new CfnOutput(this, 'ApigwHandlerOutput', {
      value: apigwHandler.functionArn,
      exportName: 'ContextService-ApigwHandlerOutput',
    });

    // Grant the Lambda read/write access to the table
    serviceTable.grantReadWriteData(apigwHandler);
  }
}
