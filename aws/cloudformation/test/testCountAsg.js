const CountAsg = require("../count_asg");
const {assert, expect} = require("chai");
const sinon = require("sinon");


const CfnResponse = require('cfn-response');
// sinon.stub(CfnResponse, "send");

describe('CountAsg', () => {
    const context = {};

    beforeEach(() => {
        sinon.stub(CfnResponse, "send")
    })

    afterEach(() => {
        CfnResponse.send.restore()
    })


    describe('handler', () => {
        it('sends CloudFormation success for Delete requests', async () => {
            const event = {RequestType: 'Delete'};

            await CountAsg.handler(event, context);

            assert(CfnResponse.send.calledOnce);
            expect(CfnResponse.send.getCall(0).args[2])
                .to.equal(CfnResponse.SUCCESS);
            
            // expect(response.status).to.equal(200);
        });

        it.only('sends CloudFormation error if no AutoScaling Group specified', async () => {
            const event = {
                RequestType: "Unknown",
                ResourceProperties: {
                    AutoScalingGroupTags: undefined
                }
            };

            await CountAsg.handler(event, context);

            const expectedResponseData = {
                // TODO
            }

            assert(CfnResponse.send.calledOnce);
            // expect(CfnResponse.send.getCall(0).args[2])
            //     .to.equal(CfnResponse.FAILED);
            console.log("it:", CfnResponse.send.getCall(0).args[3]);
            expect(CfnResponse.send.getCall(0).args[3])
                .to.equal(expectedResponseData);
        })
    });
});
