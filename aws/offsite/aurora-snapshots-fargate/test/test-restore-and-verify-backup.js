const { RDSClient } = require("@aws-sdk/client-rds");
const mysqlPromise = require("promise-mysql");
const sinon = require("sinon");

const DB_SNAPSHOT_IDENTIFIER_PREFIX = "production";
const DB_SUBNET_GROUP_NAME = "my-db-subnet-group";

process.env.DB_SNAPSHOT_IDENTIFIER_PREFIX = DB_SNAPSHOT_IDENTIFIER_PREFIX;
process.env.DB_SUBNET_GROUP_NAME = DB_SUBNET_GROUP_NAME;
const restoreAndVerify = require("../restore-and-verify-backup.js");

const CLUSTER_ID = "test-cluster";
const INSTANCE_ID = "test-instance";

const DESCRIBE_SNAPSHOT_RESULTS = {
  DBClusterSnapshots: [
    {
      DBClusterSnapshotIdentifier: "production-eligible-snapshot-1",
      SnapshotCreateTime: new Date("2019-06-14T00:00:00.000Z"),
      Status: "available",
      SnapshotType: "manual",
      EngineVersion: "8.0.mysql_aurora.3.08.0"
    },
    {
      DBClusterSnapshotIdentifier: "production-automatic-snapshot",
      SnapshotCreateTime: new Date("2019-06-15T00:00:00.000Z"),
      Status: "available",
      SnapshotType: "automated",
      EngineVersion: "8.0.mysql_aurora.3.08.0"
    },
    {
      DBClusterSnapshotIdentifier: "production-eligible-snapshot-2",
      SnapshotCreateTime: new Date("2019-06-16T00:00:00.000Z"),
      Status: "available",
      SnapshotType: "manual",
      EngineVersion: "8.0.mysql_aurora.3.08.0"
    },
    {
      DBClusterSnapshotIdentifier: "production-incomplete-snapshot",
      SnapshotCreateTime: new Date("2019-06-17T00:00:00.000Z"),
      Status: "creating",
      SnapshotType: "manual",
      EngineVersion: "8.0.mysql_aurora.3.08.0"
    }
  ]
};

describe("#restoreLatestSnapshot()", function() {
  it("should restore latest snapshot", async function() {
    const expectedLatestSnapshotName = "production-eligible-snapshot-2";

    const rdsClient = new RDSClient({});
    const sendStub = sinon.stub(rdsClient, "send");

    // Stub for describeDBClusterSnapshots
    sendStub.onFirstCall().resolves(DESCRIBE_SNAPSHOT_RESULTS);

    // Stub for restoreDBClusterFromSnapshot
    sendStub.onSecondCall().resolves({});

    // Stub for createDBInstance
    sendStub.onThirdCall().resolves({});

    // Stubs for describeDBInstances (instance availability check)
    sendStub.onCall(3).resolves({
      DBInstances: [{ DBInstanceStatus: 'available' }]
    });

    await restoreAndVerify.restoreLatestSnapshot(rdsClient, CLUSTER_ID, INSTANCE_ID);

    // Verify the commands were called with correct parameters
    const calls = sendStub.getCalls();

    // Verify describe snapshots call
    sinon.assert.match(calls[0].args[0].input, {});

    // Verify restore cluster call
    sinon.assert.match(calls[1].args[0].input, {
      DBClusterIdentifier: CLUSTER_ID,
      SnapshotIdentifier: expectedLatestSnapshotName,
      Engine: restoreAndVerify.DB_ENGINE,
      EngineVersion: "8.0.mysql_aurora.3.08.0",
      DBSubnetGroupName: DB_SUBNET_GROUP_NAME
    });

    // Verify create instance call
    sinon.assert.match(calls[2].args[0].input, {
      DBInstanceClass: restoreAndVerify.DB_INSTANCE_CLASS,
      DBClusterIdentifier: CLUSTER_ID,
      DBInstanceIdentifier: INSTANCE_ID,
      Engine: restoreAndVerify.DB_ENGINE,
      EngineVersion: "8.0.mysql_aurora.3.08.0"
    });
  });
});

describe("#changePassword()", function() {
  it("should call RDS to change the cluster password", async function() {
    const newPassword = "myNewPassword";

    const rdsClient = new RDSClient({});
    const sendStub = sinon.stub(rdsClient, "send");

    // Stub for modifyDBCluster
    sendStub.resolves({});

    await restoreAndVerify.changePassword(rdsClient, CLUSTER_ID, newPassword);

    // Verify the command was called with correct parameters
    const call = sendStub.getCall(0);
    sinon.assert.match(call.args[0].input, {
      DBClusterIdentifier: CLUSTER_ID,
      MasterUserPassword: newPassword,
      ApplyImmediately: true
    });
  });
});

const DESCRIBE_DB_INSTANCE_RESULT = {
  DBInstances: [
    {
      MasterUsername: "myAdminUsername",
      Endpoint: {
        Address: "myAuroraEndpointAddress"
      }
    }
  ]
};

describe("#verifyDb()", function() {
  afterEach(function() {
    sinon.restore();
  });

  it("should connect using the cluster master username, endpoint, and the provided password", async function() {
    const password = "myPassword";
    const rdsClient = new RDSClient({});

    const sendStub = sinon.stub(rdsClient, "send");
    sendStub.resolves(DESCRIBE_DB_INSTANCE_RESULT);

    const queryFake = sinon.fake.returns(
      Promise.resolve([
        {
          number_of_users: 1,
          last_updated_at: "now"
        }
      ])
    );

    const connection = {
      query: queryFake,
      end: sinon.fake()
    };
    sinon.replace(
      mysqlPromise,
      "createConnection",
      sinon.fake.returns(Promise.resolve(connection))
    );

    await restoreAndVerify.verifyDb(rdsClient, INSTANCE_ID, password);

    // Verify describe instances call
    const call = sendStub.getCall(0);
    sinon.assert.match(call.args[0].input, {
      DBInstanceIdentifier: INSTANCE_ID
    });

    // Verify MySQL connection parameters
    sinon.assert.calledWith(mysqlPromise.createConnection, {
      database: restoreAndVerify.DB_NAME,
      host: "myAuroraEndpointAddress",
      password: password,
      user: "myAdminUsername"
    });
    sinon.assert.calledOnce(connection.query);
    sinon.assert.calledOnce(connection.end);
  });
});

describe("#deleteCluster()", function() {
  it("should delete the instance, and then the cluster", async function() {
    const rdsClient = new RDSClient({});
    const sendStub = sinon.stub(rdsClient, "send");

    // Stubs for deleteDBInstance and deleteDBCluster
    sendStub.onFirstCall().resolves({});  // deleteDBInstance
    sendStub.onSecondCall().resolves({}); // deleteDBCluster

    await restoreAndVerify.deleteCluster(rdsClient, CLUSTER_ID, INSTANCE_ID);

    const calls = sendStub.getCalls();

    // Verify delete instance call
    sinon.assert.match(calls[0].args[0].input, {
      DBInstanceIdentifier: INSTANCE_ID,
      SkipFinalSnapshot: true
    });

    // Verify delete cluster call
    sinon.assert.match(calls[1].args[0].input, {
      DBClusterIdentifier: CLUSTER_ID,
      SkipFinalSnapshot: true
    });
  });
});