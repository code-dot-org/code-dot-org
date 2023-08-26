const {assert, expect} = require("chai");
const sinon = require("sinon");
const AWS = require('aws-sdk-mock');
const CfnResponse = require('../src/common/cfn-response');

const CountAsg = require("../src/count_asg");

describe('CountAsg', () => {
    const context = {};

    const defaultAsgDetails = {
        MinSize: 1,
        MaxSize: 10,
        DesiredCapacity: 1
    };

    beforeEach(() => {
        sinon.stub(CfnResponse, "send");
        sinon.stub()
    });

    afterEach(() => {
        CfnResponse.send.restore();
        AWS.restore('AutoScaling');
    });


    describe('handler', () => {
        it('receiving Delete, sends CloudFormation success', async () => {
            const event = {RequestType: 'Delete'};

            await CountAsg.handler(event, context);

            assert(CfnResponse.send.calledOnce);
            expect(CfnResponse.send.getCall(0).args[2])
                .to.equal(CfnResponse.SUCCESS);
            
            // expect(response.status).to.equal(200);
        });

        ['Create', 'Update'].forEach(requestType => {
            describe('receiving ${requestType},', () => {
                it('sends CloudFormation error if no AutoScaling Group specified', async () => {
                    const event = {
                        RequestType: requestType,
                        ResourceProperties: {
                            AutoScalingGroupTags: undefined
                        }
                    };
                    
                    const expectedResponseData = {
                        "Error": "No AutoScalingGroupTags found"
                    };
        
                    await CountAsg.handler(event, context);
        
                    assert(CfnResponse.send.calledOnce);
                    expect(CfnResponse.send.getCall(0).args[2])
                        .to.equal(CfnResponse.SUCCESS);
                    expect(CfnResponse.send.getCall(0).args[3])
                        .to.deep.equal(expectedResponseData);
                });
    
                it('sends default values and error details if AWS library returns an error', async () => {
                    const event = {
                        RequestType: requestType,
                        ResourceProperties: {
                            AutoScalingGroupTags: [
                                {
                                    Key: "tagKey1",
                                    Value: "tagValue1"
                                },
                            ]
                        }
                    };

                    const awsError = { Msg: 'original error' };
                    AWS.mock('AutoScaling', 'describeAutoScalingGroups', function (params, callback){
                        callback(awsError);
                    });


                    const expectedResponseData = {
                        Error: "No AutoScalingGroup found",
                        OriginalError: awsError,
                        ...defaultAsgDetails
                    };

                    await CountAsg.handler(event, context);

                    assert(CfnResponse.send.calledOnce);
                    expect(CfnResponse.send.getCall(0).args[2])
                        .to.equal(CfnResponse.SUCCESS);
                    expect(CfnResponse.send.getCall(0).args[3])
                        .to.deep.equal(expectedResponseData);
                });

                // Skipping, not implemented
                it.skip('sends default values if AWS library returns no ASGs', async () => {
                    const event = {
                        RequestType: requestType,
                        ResourceProperties: {
                            AutoScalingGroupTags: [
                                {
                                    Key: "tagKey1",
                                    Value: "tagValue1"
                                },
                            ]
                        }
                    };

                    AWS.mock('AutoScaling', 'describeAutoScalingGroups', function (params, callback){
                        data = {
                            AutoScalingGroups: []
                        }
                        callback(null, data);
                    });


                    const expectedResponseData = {
                        Error: "No AutoScalingGroups found",
                        ...defaultAsgDetails
                    };

                    await CountAsg.handler(event, context);

                    assert(CfnResponse.send.calledOnce);
                    expect(CfnResponse.send.getCall(0).args[2])
                        .to.equal(CfnResponse.SUCCESS);
                    expect(CfnResponse.send.getCall(0).args[3])
                        .to.deep.equal(expectedResponseData);
                });

                it.skip('sends default values when no matching ASG is found');
                it.skip('sends ASG values when ASG with matching tags is found');
            });
        });
    });
});
