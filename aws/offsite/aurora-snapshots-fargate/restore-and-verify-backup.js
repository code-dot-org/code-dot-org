const AWS = require("aws-sdk");
const mysqlPromise = require("promise-mysql");

/*
const DB_SNAPSHOT_IDENTIFIER_PREFIX = process.env.DB_SNAPSHOT_IDENTIFIER_PREFIX;
const DB_SUBNET_GROUP_NAME = process.env.DB_SUBNET_GROUP_NAME;
const DB_INSTANCE_CLASS = process.env.DB_INSTANCE_CLASS;
const DB_ENGINE = process.env.DB_ENGINE;
*/

const DB_SNAPSHOT_IDENTIFIER_PREFIX = "production";
const DB_SUBNET_GROUP_NAME = "vpc-dbsubnetgroup-bsykspubr80k";
const DB_INSTANCE_CLASS = "db.t3.medium";
const DB_ENGINE = "aurora-mysql";
const DB_NAME = "dashboard_production";
const NEW_PASSWORD = "asdfasdf";
const REGION = "us-east-1";
/*
const DB_CLUSTER_ID = "verification-cluster";
const DB_INSTANCE_ID = "verification-instance";
*/
const DB_CLUSTER_ID = process.env.DB_CLUSTER_ID;
const DB_INSTANCE_ID = process.env.DB_INSTANCE_ID;

const restoreLatestSnapshot = async (rds, clusterId, instanceId) => {
  // Ignore snapshots with "retain" in the name or any automated snapshots
  const snapshotFilterFunction = function(snapshot) {
    return (
      snapshot.DBClusterSnapshotIdentifier.indexOf("retain") === -1 &&
      snapshot.DBClusterSnapshotIdentifier.indexOf(
        DB_SNAPSHOT_IDENTIFIER_PREFIX
      ) !== -1 &&
      snapshot.Status === "available" &&
      snapshot.SnapshotType === "manual"
    );
  };

  // Orders newer snapshots first
  const snapshotSortFunction = function(a, b) {
    return b.SnapshotCreateTime - a.SnapshotCreateTime;
  };

  const getMostRecentSnapshot = function(unfilteredUnsortedList) {
    const filtered = unfilteredUnsortedList.filter(snapshotFilterFunction);
    return filtered.sort(snapshotSortFunction)[0];
  };

  const describeResult = await rds.describeDBClusterSnapshots({}).promise();
  const mostRecentSnapshot = getMostRecentSnapshot(
    describeResult.DBClusterSnapshots
  );

  const restoreClusterParams = {
    DBClusterIdentifier: clusterId,
    SnapshotIdentifier: mostRecentSnapshot.DBClusterSnapshotIdentifier,
    Engine: DB_ENGINE,
    DBSubnetGroupName: DB_SUBNET_GROUP_NAME
  };

  await rds.restoreDBClusterFromSnapshot(restoreClusterParams).promise();

  const createInstanceParams = {
    DBInstanceClass: DB_INSTANCE_CLASS,
    DBClusterIdentifier: clusterId,
    DBInstanceIdentifier: instanceId,
    Engine: DB_ENGINE
  };

  await rds.createDBInstance(createInstanceParams).promise();

  await rds
    .waitFor("dBInstanceAvailable", {
      DBInstanceIdentifier: instanceId
    })
    .promise();
};

// https://stackoverflow.com/a/49139664
const sleepMs = millis => {
  return new Promise(resolve => setTimeout(resolve, millis));
};

const changePassword = async (rds, clusterId, newPassword) => {
  // Update cluster password so we can connect without using production password.
  await rds
    .modifyDBCluster({
      DBClusterIdentifier: clusterId,
      MasterUserPassword: newPassword,
      ApplyImmediately: true
    })
    .promise();

  // Sleep for 30 seconds to wait for password change to take effect.
  await sleepMs(30000);
};

const verifyDb = async (rds, instanceId, password) => {
  const describeResponse = await rds
    .describeDBInstances({
      DBInstanceIdentifier: instanceId
    })
    .promise();
  const masterUsername = describeResponse.DBInstances[0].MasterUsername;
  const endpoint = describeResponse.DBInstances[0].Endpoint.Address;

  const mysqlConnection = await mysqlPromise.createConnection({
    host: endpoint,
    database: DB_NAME,
    user: masterUsername,
    password: password
  });

  try {
    const rows = mysqlConnection.query(
      "SELECT count(*) AS number_of_users, max(updated_at) AS last_updated_at FROM users"
    );

    const statusMessage =
      "Successfully queried offsite backup of database.  " +
      "Number of Users = " +
      rows[0].number_of_users +
      ", Last Updated = " +
      rows[0].last_updated_at;
    console.log(statusMessage);
  } finally {
    mysqlConnection.end();
  }
};

const deleteCluster = async (rds, clusterId, instanceId) => {
  await rds
    .deleteDBInstance({
      DBInstanceIdentifier: instanceId,
      SkipFinalSnapshot: true
    })
    .promise();

  await rds
    .deleteDBCluster({
      DBClusterIdentifier: clusterId,
      SkipFinalSnapshot: true
    })
    .promise();
};

const main = async () => {
  const rds = new AWS.RDS({ region: REGION });

  try {
    console.log("starting restore");
    await restoreLatestSnapshot(rds, DB_CLUSTER_ID, DB_INSTANCE_ID);
    console.log("restored");
    await changePassword(rds, DB_CLUSTER_ID, NEW_PASSWORD);
    console.log("password changed");
    await verifyDb(rds, DB_INSTANCE_ID, NEW_PASSWORD);
    console.log("verified");
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    console.log("deleting cluster");
    await deleteCluster(rds, DB_CLUSTER_ID, DB_INSTANCE_ID);
  }
};

main();
