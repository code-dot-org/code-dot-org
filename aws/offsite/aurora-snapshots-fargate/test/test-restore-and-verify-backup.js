const AWS = require("aws-sdk");
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
      EngineVersion: "5.7.12"
    },
    {
      DBClusterSnapshotIdentifier: "production-automatic-snapshot",
      SnapshotCreateTime: new Date("2019-06-15T00:00:00.000Z"),
      Status: "available",
      SnapshotType: "automated",
      EngineVersion: "5.7.12"
    },
    {
      DBClusterSnapshotIdentifier: "production-eligible-snapshot-2",
      SnapshotCreateTime: new Date("2019-06-16T00:00:00.000Z"),
      Status: "available",
      SnapshotType: "manual",
      EngineVersion: "5.7.12"
    },
    {
      DBClusterSnapshotIdentifier: "production-incomplete-snapshot",
      SnapshotCreateTime: new Date("2019-06-17T00:00:00.000Z"),
      Status: "creating",
      SnapshotType: "manual",
      EngineVersion: "5.7.12"
    }
  ]
};

/*
    var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
    AWS.config.credentials = credentials;
    const rds = new AWS.RDS({region: 'us-east-1'});
    */

describe("#restoreLatestSnapshot()", function() {
  it("should restore latest snapshot", async function() {
    const expectedLatestSnapshotName = "production-eligible-snapshot-2";

    const rds = new AWS.RDS();
    const describeStub = sinon.stub(rds, "describeDBClusterSnapshots");
    describeStub.withArgs({}).returns({
      promise: () => {
        return DESCRIBE_SNAPSHOT_RESULTS;
      }
    });

    const restoreDBClusterStub = sinon.stub(
      rds,
      "restoreDBClusterFromSnapshot"
    );
    restoreDBClusterStub
      .withArgs({
        DBClusterIdentifier: CLUSTER_ID,
        SnapshotIdentifier: expectedLatestSnapshotName,
        Engine: restoreAndVerify.DB_ENGINE,
        EngineVersion: "5.7.12",
        DBSubnetGroupName: DB_SUBNET_GROUP_NAME
      })
      .returns({
        promise: () => {
          return {};
        }
      });

    const createDBInstanceStub = sinon.stub(rds, "createDBInstance");
    createDBInstanceStub
      .withArgs({
        DBInstanceClass: restoreAndVerify.DB_INSTANCE_CLASS,
        DBClusterIdentifier: CLUSTER_ID,
        DBInstanceIdentifier: INSTANCE_ID,
        Engine: restoreAndVerify.DB_ENGINE,
        EngineVersion: "5.7.12"
      })
      .returns({
        promise: () => {
          return {};
        }
      });

    const waitForStub = sinon.stub(rds, "waitFor");
    waitForStub.returns({
      promise: () => {
        return {};
      }
    });

    await restoreAndVerify.restoreLatestSnapshot(rds, CLUSTER_ID, INSTANCE_ID);

    sinon.assert.calledOnce(describeStub);
    sinon.assert.calledOnce(restoreDBClusterStub);
    sinon.assert.calledOnce(createDBInstanceStub);
    sinon.assert.calledOnce(waitForStub);
  });
});

describe("#changePassword()", function() {
  it("should call RDS to change the cluster password", async function() {
    const newPassword = "myNewPassword";

    const rds = new AWS.RDS();
    const modifyDBClusterStub = sinon.stub(rds, "modifyDBCluster");
    modifyDBClusterStub
      .withArgs({
        DBClusterIdentifier: CLUSTER_ID,
        MasterUserPassword: newPassword,
        ApplyImmediately: true
      })
      .returns({
        promise: () => {
          return {};
        }
      });

    await restoreAndVerify.changePassword(rds, CLUSTER_ID, newPassword);

    sinon.assert.calledOnce(modifyDBClusterStub);
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
    const rds = new AWS.RDS();

    const describeDBInstancesStub = sinon.stub(rds, "describeDBInstances");
    describeDBInstancesStub
      .withArgs({
        DBInstanceIdentifier: INSTANCE_ID
      })
      .returns({
        promise: () => {
          return DESCRIBE_DB_INSTANCE_RESULT;
        }
      });

    const queryFake = sinon.fake.returns([
      {
        number_of_users: 1,
        last_updated_at: "now"
      }
    ]);

    const connection = {
      query: queryFake,
      end: sinon.fake()
    };
    sinon.replace(
      mysqlPromise,
      "createConnection",
      sinon.fake.returns(connection)
    );

    await restoreAndVerify.verifyDb(rds, INSTANCE_ID, password);

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
    const rds = new AWS.RDS();

    const deleteDBInstanceStub = sinon.stub(rds, "deleteDBInstance");
    deleteDBInstanceStub
      .withArgs({
        DBInstanceIdentifier: INSTANCE_ID,
        SkipFinalSnapshot: true
      })
      .returns({
        promise: () => {
          return {};
        }
      });

    const deleteDBClusterStub = sinon.stub(rds, "deleteDBCluster");
    deleteDBClusterStub
      .withArgs({
        DBClusterIdentifier: CLUSTER_ID,
        SkipFinalSnapshot: true
      })
      .returns({
        promise: () => {
          return {};
        }
      });

    await restoreAndVerify.deleteCluster(rds, CLUSTER_ID, INSTANCE_ID);

    sinon.assert.calledOnce(deleteDBInstanceStub);
    sinon.assert.calledOnce(deleteDBClusterStub);
  });
});
