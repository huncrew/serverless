// ApiStack.ts
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  LambdaIntegration,
  RestApi,
  Cors,
  IRestApi,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { UserPool, UserPoolClient, OAuthScope } from 'aws-cdk-lib/aws-cognito';

export interface ApiStackProps extends StackProps {
  apigwLambda: string;
}

export class TemplateFrontDoorStack extends Stack {
  public readonly api: IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Cognito User Pool
    const userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // Create App Client
    userPool.addClient('WebClient', {
      authFlows: { userPassword: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL],
        callbackUrls: ['http://localhost:3000/callback'],
      },
    });

    // Create API Gateway with improved CORS settings
    this.api = new RestApi(this, 'Endpoint', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Job-Id',
          'X-User-Id',
        ],
        exposeHeaders: ['X-Api-Request-Id'],
        maxAge: Duration.minutes(10),
      },
    });

    // Create Cognito Authorizer
    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: 'CognitoAuthorizer',
        identitySource: 'method.request.header.Authorization',
      },
    );

    // Import Lambda
    const importLambda = (id: string, arn: string) =>
      Function.fromFunctionAttributes(this, id, {
        functionArn: arn,
        skipPermissions: true,
      });

    const authHandler = importLambda('ApigwLambda', props.apigwLambda);

    // Helper method to secure endpoints
    const createSecureResource = (path: string) => {
      const resource = this.api.root.addResource(path);
      resource.addMethod('ANY', new LambdaIntegration(authHandler), {
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
        authorizationScopes: ['email', 'openid'],
      });
      return resource;
    };

    // Create secured resources
    const resources = [
      'crypto',
      'stripe-checkout',
      'upload-csv',
      'jobs',
      'latest-job',
      'aggregated-results',
      'intercom-callback',
    ];

    resources.forEach((resource) => {
      const securedResource = createSecureResource(resource);

      // Add method-specific configurations if needed
      if (resource === 'stripe-checkout') {
        securedResource.addMethod('POST', new LambdaIntegration(authHandler), {
          authorizationType: AuthorizationType.COGNITO,
          authorizer,
          authorizationScopes: ['email', 'openid'],
        });
      }
    });
  }
}
