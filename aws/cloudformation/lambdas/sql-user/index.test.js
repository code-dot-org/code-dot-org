const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const mysql = require("mysql");
const { SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");

const { handler } = require("./index.js");
const response = require("cfn-response-promise");

const expect = chai.expect;
chai.use(sinonChai);

describe("SQL User Custom Resource", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should handle Create event successfully", async () => {
    const event = {
      RequestType: "Create",
      ResourceProperties: {
        Privileges: ["ALL PRIVILEGES"],
      },
      PhysicalResourceId: "someId",
    };

    const context = {};

    // Mock SecretsManager calls
    sandbox
      .stub(SecretsManagerClient.prototype, "send")
      .onFirstCall()
      .resolves({
        SecretString: JSON.stringify({
          username: "admin",
          password: "adminPass",
        }),
      })
      .onSecondCall()
      .resolves({
        SecretString: JSON.stringify({
          username: "sqlUser",
          password: "sqlUserPass",
        }),
      });

    // Mock MySQL calls
    const queryStub = sandbox.stub();
    const connectionStub = {
      query: queryStub,
      end: sandbox.stub(),
      escape: sandbox.stub(),
    };
    sandbox.stub(mysql, "createConnection").returns(connectionStub);
    queryStub.callsFake((query, callback) => callback(null, {}));

    // Mock cfn-response
    const responseStub = sandbox.stub(response, "send").callsFake(() => {});

    await handler(event, context);

    expect(queryStub).to.have.been.called;
    expect(responseStub).to.have.been.calledWith(
      event,
      context,
      response.SUCCESS
    );
  });

  it("should handle Delete event successfully", async () => {
    const event = {
      RequestType: "Delete",
      ResourceProperties: {
        /* Your properties */
      },
      PhysicalResourceId: "someId",
    };

    const context = {}; // Your context

    // Mock SecretsManager calls
    sandbox
      .stub(SecretsManagerClient.prototype, "send")
      .onFirstCall()
      .resolves({
        SecretString: JSON.stringify({
          username: "admin",
          password: "adminPass",
        }),
      })
      .onSecondCall()
      .resolves({
        SecretString: JSON.stringify({
          username: "sqlUser",
          password: "sqlUserPass",
        }),
      });

    // Mock MySQL calls
    const queryStub = sandbox.stub();
    const connectionStub = { query: queryStub, end: sandbox.stub() };
    sandbox.stub(mysql, "createConnection").returns(connectionStub);
    queryStub.callsFake((query, callback) => callback(null, {}));

    // Mock cfn-response
    const responseStub = sandbox.stub(response, "send").callsFake(() => {});

    await handler(event, context);

    expect(queryStub).to.have.been.called;
    expect(responseStub).to.have.been.calledWith(
      event,
      context,
      response.SUCCESS
    );
  });
});
