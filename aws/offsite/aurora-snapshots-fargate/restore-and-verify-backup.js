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
const crypto = require('crypto');

function generateSimplePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }

  return password;
}

const DB_CLUSTER_ID = process.env.DB_CLUSTER_ID;
const DB_INSTANCE_ID = process.env.DB_INSTANCE_ID;
const DB_SNAPSHOT_IDENTIFIER_PREFIX = process.env.DB_SNAPSHOT_IDENTIFIER_PREFIX;
const DB_SUBNET_GROUP_NAME = process.env.DB_SUBNET_GROUP_NAME;
const DB_SECURITY_GROUP_ID = process.env.DB_SECURITY_GROUP_ID;
const REGION = process.env.REGION;
const DB_INSTANCE_CLASS = process.env.DB_INSTANCE_CLASS;
const DB_ENGINE = process.env.DB_ENGINE;
const DB_NAME = process.env.DB_NAME;
const NEW_PASSWORD = generateSimplePassword(32);

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
    // Get the last (most recent) row from the `users` table.
    const rows = await mysqlConnection.query(
      "SELECT id, updated_at FROM users ORDER BY id DESC LIMIT 1"
    );

    const updatedAt = new Date(rows[0].updated_at);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const statusMessage = `Queried offsite backup of database.
      The most recently created User in the restored database has ID ${rows[0].id} and was Updated At ${updatedAt}.`;
    console.log(statusMessage);

    if (updatedAt < oneDayAgo) {
      throw new Error(`Latest user updated date/time (${updatedAt.toISOString()}) from the most recent offsite database
       backup is more than 24 hours old. Recent database backups are not available/restorable in the offsite account.`);
    }
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