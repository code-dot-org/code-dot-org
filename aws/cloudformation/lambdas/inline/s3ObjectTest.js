const {assert, expect} = require("chai");
const sinon = require("sinon");
const AWS = require('aws-sdk-mock');

const CfnResponse = require('./cfn-response');

const S3Object = require("./s3Object");


describe('S3Object', () => {
  let deleteObjectSpy;
  let putObjectSpy;
  
  beforeEach(() => {
    sinon.stub(CfnResponse, "send");

    // Mock S3 calls to throw an error. Tests should override this behavior
    deleteObjectSpy = sinon.spy((params, callback) => {
      callback(new Error('Mock deleteObject Error'), {});
    });
    putObjectSpy = sinon.spy((params, callback) => {
      callback(new Error('Mock putObject Error'), {});
    });
    AWS.mock('S3', 'deleteObject', deleteObjectSpy);
    AWS.mock('S3', 'putObject', putObjectSpy);
  });

  afterEach(() => {
    CfnResponse.send.restore();
    AWS.restore();
  });

  describe('handler', () => {
    it('rejects unexpected request types', () => {
      const event = {
        RequestType: 'Invalid',
      };
      const context = {};

      S3Object.handler(event, context);
      
      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'CfnResponse.send not called once');
      expect(CfnResponse.send.getCall(0).args[2])
        .to.equal(CfnResponse.FAILED);
      
      // No S3 actions should be executed
      assert.isFalse(deleteObjectSpy.calledOnce);
      assert.isFalse(putObjectSpy.calledOnce);
    });

    it('CREATE fails when Bucket is not specified', async () => {
      await requestFailsWhenBucketIsNotSpecified('Create');
    });

    it('UPDATE fails when Bucket is not specified', async () => {
      await requestFailsWhenBucketIsNotSpecified('Update');
    });

    it('DELETE fails when Bucket is not specified', async () => {
      await requestFailsWhenBucketIsNotSpecified('Delete');
    });

    requestFailsWhenBucketIsNotSpecified = async (requestType) => {
      const event = {
        RequestType: requestType,
        ResourceProperties: {
          Key: 'mykey'
        }
      };

      await S3Object.handler(event, {});
      
      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'CfnResponse.send not called once');
      expect(CfnResponse.send.getCall(0).args[2])
        .to.equal(CfnResponse.FAILED);
      
      // No S3 actions should be executed
      assert.isFalse(deleteObjectSpy.calledOnce);
      assert.isFalse(putObjectSpy.calledOnce);
    };

    it('CREATE fails when Key is not specified', async () => {
      await requestFailsWhenKeyIsNotSpecified('Create');
    });

    it('UPDATE fails when Key is not specified', async () => {
      await requestFailsWhenKeyIsNotSpecified('Update');
    });

    it('DELETE fails when Key is not specified', async () => {
      await requestFailsWhenKeyIsNotSpecified('Delete');
    });

    requestFailsWhenKeyIsNotSpecified = async (requestType) => {
      const event = {
        RequestType: requestType,
        ResourceProperties: {
          Bucket: 'mybucket'
        }
      };

      await S3Object.handler(event, {});
      
      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'CfnResponse.send not called once');
      expect(CfnResponse.send.getCall(0).args[2])
        .to.equal(CfnResponse.FAILED);

      // No S3 actions should be executed
      assert.isFalse(deleteObjectSpy.calledOnce);
      assert.isFalse(putObjectSpy.calledOnce);
    };

    it('DELETE fails when S3 deleteObject fails', async () => {
      const event = {
        RequestType: 'Delete',
        ResourceProperties: {Bucket: 'mybucket', Key: 'mykey'}
      };

      const expectedError = new Error({Error: "Some Error From S3"});
      AWS.restore('S3', 'deleteObject');
      AWS.mock('S3', 'deleteObject', function (params, callback){
        callback(expectedError, null);
      });

      await S3Object.handler(event, {});
      
      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'CfnResponse.send not called once');
      expect(CfnResponse.send.getCall(0).args[2])
          .to.equal(CfnResponse.FAILED);
      expect(CfnResponse.send.getCall(0).args[3])
          .to.deep.equal(expectedError);
    });

    it('DELETE executes S3 delete action', async () => {
      const event = {
        RequestType: 'Delete',
        ResourceProperties: {Bucket: 'mybucket', Key: 'mykey'}
      };

      AWS.restore('S3', 'deleteObject');
      deleteObjectSpy = sinon.spy((params, callback) => {
        callback(null, {});
      });
      AWS.mock('S3', 'deleteObject', deleteObjectSpy);

      await S3Object.handler(event, {});

      // S3 deleteObject should be called with expected arguments
      assert(deleteObjectSpy.calledOnce);
      expect(deleteObjectSpy.getCall(0).args[0]).to.deep.equal(
        {Bucket: 'mybucket', Key: 'mykey', }
      );

      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'should call CfnResponse.send');
      expect(CfnResponse.send.getCall(0).args[2])
      .to.equal(CfnResponse.SUCCESS);
      expect(CfnResponse.send.getCall(0).args[4])
      .to.deep.equal('mybucket/mykey', 'should return physicalResourceId');
    });

    it('CREATE fails when S3 putObject fails', async () => {
      const event = {
        RequestType: 'Create',
        ResourceProperties: {Bucket: 'mybucket', Key: 'mykey'}
      };

      const expectedError = new Error({Error: "Some Error From S3"});
      AWS.restore('S3', 'putObject');
      AWS.mock('S3', 'putObject', function (params, callback){
        callback(expectedError, null);
      });

      await S3Object.handler(event, {});
      
      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'CfnResponse.send not called once');
      expect(CfnResponse.send.getCall(0).args[2])
          .to.equal(CfnResponse.FAILED);
      expect(CfnResponse.send.getCall(0).args[3])
          .to.deep.equal(expectedError);
    });

    it('CREATE executes S3 put action', async () => {
      const event = {
        RequestType: 'Create',
        ResourceProperties: {Bucket: 'mybucket', Key: 'mykey'}
      };

      AWS.restore('S3', 'putObject');
      putObjectSpy = sinon.spy((params, callback) => {
        callback(null, {});
      });
      AWS.mock('S3', 'putObject', putObjectSpy);

      await S3Object.handler(event, {});

      // S3 putobject should be called with expected arguments
      assert(putObjectSpy.calledOnce);
      expect(putObjectSpy.getCall(0).args[0]).to.deep.equal(
        {Bucket: 'mybucket', Key: 'mykey'}
      );

      // Expected response should be returned
      assert(CfnResponse.send.calledOnce, 'should call CfnResponse.send');
      expect(CfnResponse.send.getCall(0).args[2])
      .to.equal(CfnResponse.SUCCESS);
      expect(CfnResponse.send.getCall(0).args[4])
      .to.deep.equal('mybucket/mykey', 'should return physicalResourceId');
    });
  });
});
