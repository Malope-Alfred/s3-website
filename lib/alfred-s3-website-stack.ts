import { Stack, StackProps, RemovalPolicy, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

interface ExtendedStackProps extends StackProps {
  readonly stackName: string;
  readonly envSuffix: string;
}

export class AlfredS3WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: ExtendedStackProps) {
    super(scope, id, props);

    const bucketName = `${props.stackName}-grad-2025-${props.envSuffix}`;

    const AlfredS3Bucket = new s3.Bucket(this, bucketName, {
      bucketName: bucketName,
      publicReadAccess: false, 
      removalPolicy: RemovalPolicy.DESTROY, 
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });


    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../src'))],
      destinationBucket: AlfredS3Bucket,
      retainOnDelete: false,
    });


    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');

    AlfredS3Bucket.grantRead(oai)

    const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(AlfredS3Bucket, {
          originAccessIdentity: oai, 
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
      ],
    });


    new CfnOutput(this, 'WebsiteURL', {
      value: `https://${cloudfrontDistribution.distributionDomainName}`,
      description: 'The CloudFront URL',
    });
  }
}
