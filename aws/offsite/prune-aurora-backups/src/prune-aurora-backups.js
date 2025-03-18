const AWS = require("aws-sdk");

const NUM_SNAPSHOTS_TO_KEEP = 5;
const DB_SNAPSHOT_IDENTIFIER_PREFIX = "production";

// Delete each of the snapshots in the list
const deleteSnapshots = async function(rds, snapshots) {
  for (const s of snapshots) {
    console.log("Deleting snapshot with ID " + s.DBClusterSnapshotIdentifier);

    await rds
      .deleteDBClusterSnapshot({
        DBClusterSnapshotIdentifier: s.DBClusterSnapshotIdentifier
      })
      .promise();
  }
};

/* Only snapshots created by the offsite backup system are eligible, which have the following properties:
 * - SnapshotType = Manual (since they are created by our cron job calling APIs to copy snapshots from the main account)
 * - Have 'production' in the name
 *
 * In addition, we exclude snapshots that aren't fully provisioned, and snapshots that have 'retain' in the name. */
const isSnapshotDeletionEligible = function(snapshot) {
  return (
    !snapshot.DBClusterSnapshotIdentifier.includes("retain") &&
    snapshot.DBClusterSnapshotIdentifier.includes(
      DB_SNAPSHOT_IDENTIFIER_PREFIX
    ) &&
    snapshot.Status === "available" &&
    snapshot.SnapshotType === "manual"
  );
};

/* Return all snapshots created by offsite backup system which are eligible for automatic deletion,
 * except the N newest snapshots, where N is the number of snapshots we want to keep. */
const getSnapshotsToDelete = function(allSnapshots) {
  /* Filter list to only eligible snapshots created by offsite backup system.
   * Then, sort list by age in descending order (newest snapshots first).
   * Finally, return the all but the last NUM_SNAPSHOTS_TO_KEEP elements. */
  return allSnapshots
    .filter(isSnapshotDeletionEligible)
    .sort((a, b) => b.SnapshotCreateTime - a.SnapshotCreateTime)
    .slice(NUM_SNAPSHOTS_TO_KEEP);
};

const handler = async (event, context) => {
  const rds = new AWS.RDS();

  const describeResponse = await rds.describeDBClusterSnapshots({}).promise();

  const snapshotsToDelete = getSnapshotsToDelete(
    describeResponse.DBClusterSnapshots
  );
  console.log("Deleting " + snapshotsToDelete.length + " snapshots");
  await deleteSnapshots(rds, snapshotsToDelete);

  return "success";
};

module.exports = {
  handler,
  getSnapshotsToDelete,
  isSnapshotDeletionEligible
};
