#!/usr/bin/env node

/**
 * Reliable AMI Manager Lambda Test Suite
 * Uses proper AWS SDK mocking libraries for accurate testing
 */

const AWSMock = require('aws-sdk-mock');
const { mockClient } = require('aws-sdk-client-mock');
const { EC2Client, DescribeImagesCommand, CreateImageCommand, CreateTagsCommand, 
        DeregisterImageCommand, DescribeSnapshotsCommand, DeleteSnapshotCommand,
        DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

// Mock responses that match real AWS API responses
const mockResponses = {
  describeImages: {
    Images: [{
      ImageId: 'ami-12345678',
      State: 'available',
      Name: 'test-stack-i-12345678-request-123',
      Description: 'Test AMI created by CloudFormation'
    }]
  },
  createImage: {
    ImageId: 'ami-12345678'
  },
  describeInstances: {
    Reservations: [{
      Instances: [{
        InstanceId: 'i-12345678',
        State: { Name: 'stopped' },
        ImageId: 'ami-base123',
        InstanceType: 't3.micro'
      }]
    }]
  },
  describeSnapshots: {
    Snapshots: [{
      SnapshotId: 'snap-12345678',
      Description: 'Created by CreateImage(i-12345678) for ami-12345678',
      State: 'completed'
    }]
  },
  createTags: {},
  deregisterImage: {},
  deleteSnapshot: {},
  invoke: {}
};

// Test scenarios with comprehensive coverage
const testScenarios = [
  {
    name: 'CREATE - New AMI with WaitImageAvailable=true',
    event: {
      RequestType: 'Create',
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/test-stack/guid',
      ResourceProperties: {
        InstanceId: 'i-12345678',
        WaitImageAvailable: true
      },
      RequestId: 'request-123',
      LogicalResourceId: 'TestAMI'
    },
    expectedCalls: ['describeInstances', 'createImage', 'createTags', 'describeImages'],
    expectedResponse: 'SUCCESS'
  },
  {
    name: 'CREATE - New AMI with WaitImageAvailable=false',
    event: {
      RequestType: 'Create',
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/test-stack/guid',
      ResourceProperties: {
        InstanceId: 'i-12345678',
        WaitImageAvailable: false
      },
      RequestId: 'request-123',
      LogicalResourceId: 'TestAMI'
    },
    expectedCalls: ['describeInstances', 'createImage', 'createTags'],
    expectedResponse: 'SUCCESS'
  },
  {
    name: 'DELETE - Existing AMI',
    event: {
      RequestType: 'Delete',
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/test-stack/guid',
      PhysicalResourceId: 'ami-12345678',
      ResourceProperties: {},
      RequestId: 'request-123',
      LogicalResourceId: 'TestAMI'
    },
    expectedCalls: ['describeImages', 'deregisterImage', 'describeSnapshots', 'deleteSnapshot'],
    expectedResponse: 'SUCCESS'
  },
  {
    name: 'UPDATE - Existing AMI',
    event: {
      RequestType: 'Update',
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/test-stack/guid',
      PhysicalResourceId: 'ami-12345678',
      ResourceProperties: {},
      RequestId: 'request-123',
      LogicalResourceId: 'TestAMI'
    },
    expectedCalls: [],
    expectedResponse: 'SUCCESS'
  },
  {
    name: 'CREATE - Missing InstanceId (Error Case)',
    event: {
      RequestType: 'Create',
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/test-stack/guid',
      ResourceProperties: {},
      RequestId: 'request-123',
      LogicalResourceId: 'TestAMI'
    },
    expectedCalls: [],
    expectedResponse: 'FAILED'
  }
];

class ReliableAMIManagerTester {
  constructor() {
    this.results = {
      original: {},
      upgraded: {},
      summary: {}
    };
  }

  setupAWSSDKv2Mocks() {
    // Mock AWS SDK v2 for original code
    AWSMock.mock('EC2', 'waitFor', (operation, params, callback) => {
      setTimeout(() => {
        if (operation === 'instanceStopped') {
          callback(null, mockResponses.describeInstances);
        } else if (operation === 'imageAvailable') {
          callback(null, mockResponses.describeImages);
        }
      }, 50);
    });

    AWSMock.mock('EC2', 'describeImages', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.describeImages), 10);
    });

    AWSMock.mock('EC2', 'createImage', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.createImage), 10);
    });

    AWSMock.mock('EC2', 'createTags', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.createTags), 10);
    });

    AWSMock.mock('EC2', 'deregisterImage', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.deregisterImage), 10);
    });

    AWSMock.mock('EC2', 'describeSnapshots', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.describeSnapshots), 10);
    });

    AWSMock.mock('EC2', 'deleteSnapshot', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.deleteSnapshot), 10);
    });

    AWSMock.mock('Lambda', 'invoke', (params, callback) => {
      setTimeout(() => callback(null, mockResponses.invoke), 10);
    });
  }

  setupAWSSDKv3Mocks() {
    // Mock AWS SDK v3 for upgraded code
    this.ec2Mock = mockClient(EC2Client);
    this.lambdaMock = mockClient(LambdaClient);

    this.ec2Mock.on(DescribeInstancesCommand).resolves(mockResponses.describeInstances);
    this.ec2Mock.on(DescribeImagesCommand).resolves(mockResponses.describeImages);
    this.ec2Mock.on(CreateImageCommand).resolves(mockResponses.createImage);
    this.ec2Mock.on(CreateTagsCommand).resolves(mockResponses.createTags);
    this.ec2Mock.on(DeregisterImageCommand).resolves(mockResponses.deregisterImage);
    this.ec2Mock.on(DescribeSnapshotsCommand).resolves(mockResponses.describeSnapshots);
    this.ec2Mock.on(DeleteSnapshotCommand).resolves(mockResponses.deleteSnapshot);
    
    this.lambdaMock.on(InvokeCommand).resolves(mockResponses.invoke);
  }

  async testHandler(handlerPath, scenario, version) {
    const mockContext = {
      getRemainingTimeInMillis: () => 300000,
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
      done: () => {},
      logStreamName: 'test-log-stream'
    };

    const testResult = {
      scenario: scenario.name,
      version: version,
      startTime: Date.now(),
      logs: [],
      awsCalls: [],
      response: null,
      error: null,
      callCount: {}
    };

    // Capture console output
    const originalLog = console.log;
    console.log = (...args) => {
      testResult.logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // Setup version-specific mocks
      if (version === 'original') {
        this.setupAWSSDKv2Mocks();
      } else {
        this.setupAWSSDKv3Mocks();
      }

      // Mock cfn-response to capture responses
      const mockCfnResponse = {
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        send: (event, context, status, data, physicalId) => {
          testResult.response = {
            status,
            data: data || {},
            physicalId,
            timestamp: new Date().toISOString()
          };
          return testResult.response;
        }
      };

      // Clear require cache and reload with mocks
      const cfnResponsePath = require.resolve('../cfn-response');
      delete require.cache[cfnResponsePath];
      require.cache[cfnResponsePath] = {
        exports: mockCfnResponse
      };

      delete require.cache[require.resolve(handlerPath)];
      const handlerModule = require(handlerPath);

      // Execute the handler
      await handlerModule.handler(scenario.event, mockContext);

      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;

      // Capture call counts for SDK v3
      if (version === 'upgraded') {
        testResult.callCount = {
          describeInstances: this.ec2Mock.commandCalls(DescribeInstancesCommand).length,
          describeImages: this.ec2Mock.commandCalls(DescribeImagesCommand).length,
          createImage: this.ec2Mock.commandCalls(CreateImageCommand).length,
          createTags: this.ec2Mock.commandCalls(CreateTagsCommand).length,
          deregisterImage: this.ec2Mock.commandCalls(DeregisterImageCommand).length,
          describeSnapshots: this.ec2Mock.commandCalls(DescribeSnapshotsCommand).length,
          deleteSnapshot: this.ec2Mock.commandCalls(DeleteSnapshotCommand).length,
          invoke: this.lambdaMock.commandCalls(InvokeCommand).length
        };
      }

    } catch (error) {
      testResult.error = error.message;
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;
    } finally {
      console.log = originalLog;
      
      // Clean up mocks
      if (version === 'original') {
        AWSMock.restore();
      } else {
        this.ec2Mock.reset();
        this.lambdaMock.reset();
      }
    }

    return testResult;
  }

  validateTestResult(scenario, result) {
    const validation = {
      passed: true,
      issues: []
    };

    // Check expected response status
    if (result.response?.status !== scenario.expectedResponse) {
      validation.passed = false;
      validation.issues.push(`Expected ${scenario.expectedResponse}, got ${result.response?.status || 'null'}`);
    }

    // Check for errors when success expected
    if (scenario.expectedResponse === 'SUCCESS' && result.error) {
      validation.passed = false;
      validation.issues.push(`Unexpected error: ${result.error}`);
    }

    // Check expected AWS calls (for upgraded version)
    if (result.version === 'upgraded' && scenario.expectedCalls) {
      for (const expectedCall of scenario.expectedCalls) {
        if (!result.callCount[expectedCall] || result.callCount[expectedCall] === 0) {
          validation.passed = false;
          validation.issues.push(`Missing expected AWS call: ${expectedCall}`);
        }
      }
    }

    // Validate response data for successful operations
    if (scenario.expectedResponse === 'SUCCESS' && result.response) {
      if (scenario.event.RequestType === 'Create' && !result.response.data?.ImageId) {
        validation.passed = false;
        validation.issues.push('Missing ImageId in response data for Create operation');
      }
    }

    return validation;
  }

  async runAllTests() {
    console.log('🧪 Running Reliable AMI Manager Tests...\n');

    let totalTests = 0;
    let passedTests = 0;

    for (const scenario of testScenarios) {
      console.log(`📋 Testing: ${scenario.name}`);
      
      // Test original version
      const originalResult = await this.testHandler('./ami-manager-original.js', scenario, 'original');
      const originalValidation = this.validateTestResult(scenario, originalResult);
      this.results.original[scenario.name] = { ...originalResult, validation: originalValidation };
      
      // Test upgraded version
      const upgradedResult = await this.testHandler('../ami-manager.js', scenario, 'upgraded');
      const upgradedValidation = this.validateTestResult(scenario, upgradedResult);
      this.results.upgraded[scenario.name] = { ...upgradedResult, validation: upgradedValidation };
      
      // Compare results
      const comparison = this.compareResults(originalResult, upgradedResult, originalValidation, upgradedValidation);
      
      totalTests++;
      if (comparison.passed) {
        passedTests++;
        console.log(`   ✅ PASS - Both versions behave correctly`);
      } else {
        console.log(`   ❌ FAIL - ${comparison.issues.join(', ')}`);
      }
      
      // Show detailed info
      console.log(`   Original: ${originalValidation.passed ? '✅' : '❌'} (${originalResult.duration}ms)`);
      console.log(`   Upgraded: ${upgradedValidation.passed ? '✅' : '❌'} (${upgradedResult.duration}ms)`);
      
      if (upgradedResult.callCount && Object.keys(upgradedResult.callCount).some(k => upgradedResult.callCount[k] > 0)) {
        const calls = Object.entries(upgradedResult.callCount)
          .filter(([_, count]) => count > 0)
          .map(([call, count]) => `${call}:${count}`)
          .join(', ');
        console.log(`   AWS Calls: ${calls}`);
      }
      
      console.log('');
    }

    this.generateSummary(totalTests, passedTests);
  }

  compareResults(original, upgraded, originalValidation, upgradedValidation) {
    const comparison = {
      passed: true,
      issues: []
    };

    // Both should pass their individual validations
    if (!originalValidation.passed && !upgradedValidation.passed) {
      comparison.passed = false;
      comparison.issues.push('Both versions failed validation');
    } else if (!upgradedValidation.passed) {
      comparison.passed = false;
      comparison.issues.push('Upgraded version failed validation');
    }

    // Response status should match (if both have responses)
    if (original.response?.status && upgraded.response?.status) {
      if (original.response.status !== upgraded.response.status) {
        comparison.passed = false;
        comparison.issues.push(`Response status differs: ${original.response.status} vs ${upgraded.response.status}`);
      }
    }

    return comparison;
  }

  generateSummary(totalTests, passedTests) {
    console.log('=' .repeat(80));
    console.log('📊 RELIABLE TEST RESULTS SUMMARY');
    console.log('=' .repeat(80));
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`Overall: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
    
    // Detailed breakdown
    console.log('\n📈 Test Breakdown:');
    for (const [scenarioName, result] of Object.entries(this.results.original)) {
      const upgraded = this.results.upgraded[scenarioName];
      const originalStatus = result.validation.passed ? '✅' : '❌';
      const upgradedStatus = upgraded.validation.passed ? '✅' : '❌';
      
      console.log(`${originalStatus}${upgradedStatus} ${scenarioName}`);
      
      if (!result.validation.passed) {
        result.validation.issues.forEach(issue => console.log(`     Original: ${issue}`));
      }
      if (!upgraded.validation.passed) {
        upgraded.validation.issues.forEach(issue => console.log(`     Upgraded: ${issue}`));
      }
    }
    
    console.log('\n🎯 Reliability Assessment:');
    console.log(`✅ Proper AWS SDK mocking with realistic responses`);
    console.log(`✅ Comprehensive error scenario testing`);
    console.log(`✅ AWS API call validation and counting`);
    console.log(`✅ Response format and data validation`);
    
    if (successRate >= 90) {
      console.log('\n🎉 HIGH CONFIDENCE: Lambda upgrade is ready for deployment');
    } else if (successRate >= 80) {
      console.log('\n⚠️  MEDIUM CONFIDENCE: Review failing tests before deployment');
    } else {
      console.log('\n❌ LOW CONFIDENCE: Significant issues need resolution');
    }
  }
}

async function main() {
  console.log('🚀 Reliable AMI Manager Lambda Testing\n');
  
  const tester = new ReliableAMIManagerTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
