#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LearningCdkStack } from '../lib/learning-cdk-stack';

const app = new cdk.App();
new LearningCdkStack(app, 'LearningCdkStack');
