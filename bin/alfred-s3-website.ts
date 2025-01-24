#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AlfredS3WebsiteStack } from '../lib/alfred-s3-website-stack';

const app = new cdk.App();
new AlfredS3WebsiteStack(app, 'AlfredS3WebsiteStack', {
  stackName: 'alfred-s3-website',
  env: { 
    account: process.env.CDK_DEPLOY_ACCOUNT, 
    region: process.env.CDK_DEPLOY_REGION
  },
  tags: {
    Name: "alfred-s3-website",
    Environment: "dev",
    Project: "Grad Project",
    ManagedBy: "Alfred.Malope@bbd.co.za",
  },
  envSuffix: "dev",
});