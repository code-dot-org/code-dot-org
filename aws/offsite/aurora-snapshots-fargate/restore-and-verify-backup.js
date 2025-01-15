const { RDSClient,
  DescribeDBClusterSnapshotsCommand,
  RestoreDBClusterFromSnapshotCommand,
  CreateDBInstanceCommand,
  ModifyDBClusterCommand,
  DescribeDBInstancesCommand,
  DeleteDBInstanceCommand,
  DeleteDBClusterCommand
} = require("@aws-sdk/client-rds");
const mysqlPromise = require("promise-mysql");
const Honeybadger = require("honeybadger");

const DB_CLUSTER_ID = process.env.DB_CLUSTER_ID;
const DB_INSTANCE_ID = process.env.DB_INSTANCE_ID;
const DB_SNAPSHOT_IDENTIFIER_PREFIX = process.env.DB_SNAPSHOT_IDENTIFIER_PREFIX;
const DB_SUBNET_GROUP_NAME = process.env.DB_SUBNET_GROUP_NAME;
const DB_SECURITY_GROUP_ID = process.env.DB_SECURITY_GROUP_ID;
const REGION = process.env.REGION;

const DB_INSTANCE_CLASS = "db.t3.medium";
const DB_ENGINE = "aurora-mysql";
const DB_NAME = "dashboard_production";
const NEW_PASSWORD = "asdfasdf";

const restoreLatestSnapshot = async (rdsClient, clusterId, instanceId) => {
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

  const describeCommand = new DescribeDBClusterSnapshotsCommand({});
  const describeResult = await rdsClient.send(describeCommand);

  const mostRecentSnapshot = getMostRecentSnapshot(
    describeResult.DBClusterSnapshots
  );

  const restoreClusterCommand = new RestoreDBClusterFromSnapshotCommand({
    DBClusterIdentifier: clusterId,
    SnapshotIdentifier: mostRecentSnapshot.DBClusterSnapshotIdentifier,
    Engine: DB_ENGINE,
    EngineVersion: mostRecentSnapshot.EngineVersion,
    DBSubnetGroupName: DB_SUBNET_GROUP_NAME,
    VpcSecurityGroupIds: [DB_SECURITY_GROUP_ID]
  });

  await rdsClient.send(restoreClusterCommand);

  const createInstanceCommand = new CreateDBInstanceCommand({
    DBInstanceClass: DB_INSTANCE_CLASS,
    DBClusterIdentifier: clusterId,
    DBInstanceIdentifier: instanceId,
    Engine: DB_ENGINE,
    EngineVersion: mostRecentSnapshot.EngineVersion
  });

  await rdsClient.send(createInstanceCommand);

  // Wait for instance to be available
  let instanceAvailable = false;
  let attempts = 0;
  const maxAttempts = 120;
  const delaySeconds = 60;

  while (!instanceAvailable && attempts < maxAttempts) {
    try {
      const describeInstanceCommand = new DescribeDBInstancesCommand({
        DBInstanceIdentifier: instanceId
      });
      const response = await rdsClient.send(describeInstanceCommand);

      if (response.DBInstances[0].DBInstanceStatus === 'available') {
        instanceAvailable = true;
      } else {
        attempts++;
        await sleepMs(delaySeconds * 1000);
      }
    } catch (error) {
      attempts++;
      await sleepMs(delaySeconds * 1000);
    }
  }

  if (!instanceAvailable) {
    throw new Error(`Instance ${instanceId} did not become available after ${maxAttempts} attempts`);
  }
};

const sleepMs = millis => {
  return new Promise(resolve => setTimeout(resolve, millis));
};

const changePassword = async (rdsClient, clusterId, newPassword) => {
  const modifyCommand = new ModifyDBClusterCommand({
    DBClusterIdentifier: clusterId,
    MasterUserPassword: newPassword,
    ApplyImmediately: true
  });

  await rdsClient.send(modifyCommand);
};

const verifyDb = async (rdsClient, instanceId, password) => {
  const describeCommand = new DescribeDBInstancesCommand({
    DBInstanceIdentifier: instanceId
  });

  const describeResponse = await rdsClient.send(describeCommand);
  const masterUsername = describeResponse.DBInstances[0].MasterUsername;
  const endpoint = describeResponse.DBInstances[0].Endpoint.Address;

  const mysqlConnection = await mysqlPromise.createConnection({
    host: endpoint,
    database: DB_NAME,
    user: masterUsername,
    password: password
  });

  try {
    const rows = await mysqlConnection.query(
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

const deleteCluster = async (rdsClient, clusterId, instanceId) => {
  const deleteInstanceCommand = new DeleteDBInstanceCommand({
    DBInstanceIdentifier: instanceId,
    SkipFinalSnapshot: true
  });

  await rdsClient.send(deleteInstanceCommand);

  const deleteClusterCommand = new DeleteDBClusterCommand({
    DBClusterIdentifier: clusterId,
    SkipFinalSnapshot: true
  });

  await rdsClient.send(deleteClusterCommand);
};

const main = async () => {
  const rdsClient = new RDSClient({ region: REGION });

  try {
    console.log("Starting restore of database from latest snapshot");

    await restoreLatestSnapshot(rdsClient, DB_CLUSTER_ID, DB_INSTANCE_ID);
    console.log("Database restored and available");

    await changePassword(rdsClient, DB_CLUSTER_ID, NEW_PASSWORD);
    console.log("Successfully changed password");
    // Sleep for 30 seconds to wait for password change to take effect
    await sleepMs(30000);

    await verifyDb(rdsClient, DB_INSTANCE_ID, NEW_PASSWORD);
    console.log("verified");
  } catch (error) {
    Honeybadger.notify(error, {
      name: "Offsite account snapshot verification"
    });
    console.log(error);
    throw error;
  } finally {
    console.log("deleting cluster");
    await deleteCluster(rdsClient, DB_CLUSTER_ID, DB_INSTANCE_ID);
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  restoreLatestSnapshot,
  changePassword,
  verifyDb,
  deleteCluster,
  main,
  DB_INSTANCE_CLASS,
  DB_ENGINE,
  DB_NAME
};