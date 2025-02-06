import { Stack, CfnOutput, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import config from '../../envConstants';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export interface LambdaStackProps extends StackProps {
  lambdaCodePath: string;
  projectContextTable: Table;
  // myQueue: Queue;
}

export class LambdaStack extends Stack {
  public readonly apigwHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // apigw lambda
    this.apigwHandler = new NodejsFunction(this, 'ApigwHandler', {
      entry: `${props.lambdaCodePath}/apigw-requests/index.ts`,
      environment: {
        STRIPE_SECRET_KEY: config.STRIPE_SECRET_KEY,
        OPENAI_KEY: config.OPENAI_KEY,
        COINMARKETCAP_API_KEY: config.COINMARKETCAP_API_KEY,
      },
      timeout: Duration.seconds(90), // Set timeout to 90 seconds
    });

    this.apigwHandler.addPermission('GenerateAIInvokePermission', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*/*/*/*`,
    });

    // Output the lambda function ARN
    new CfnOutput(this, 'ApigwHandlerOutput', {
      value: this.apigwHandler.functionArn,
      exportName: 'ContextService-ApigwHandlerOutput',
    });

    props.projectContextTable.grantReadWriteData(this.apigwHandler);

    // // GENERATE AI
    // this.generateAI = new NodejsFunction(this, 'GenerateAI', {
    //   entry: `${props.lambdaCodePath}/sqs-generate-ai-chatgpt/index.ts`,
    //   timeout: Duration.seconds(600),
    //   environment: {
    //     PROJECT_CONTEXT_TABLE_NAME: props.projectContextTable.tableName,
    //     OPENAI_KEY: config.OPENAI_KEY,
    //   },
    // });

    // this.generateAI.addPermission('GenerateAIInvokePermission', {
    //   principal: new ServicePrincipal('apigateway.amazonaws.com'),
    //   action: 'lambda:InvokeFunction',
    //   sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*/*/*/*`,
    // });

    // // Grant permissions to consume messages from the SQS queue
    // props.myQueue.grantConsumeMessages(this.generateAI);

    // // Add SQS event source to the generateAI lambda
    // this.generateAI.addEventSource(new SqsEventSource(props.myQueue));

    // // Output the lambda function ARN
    // new CfnOutput(this, 'GenerateAIHandler', {
    //   value: this.generateAI.functionArn,
    //   exportName: 'ContextService-GenerateAIHandlerArn',
    // });
  }
}
