var AWS = require('aws-sdk');

// For local testing, credentials are not pre-supplied
//
//AWS.config.region = 'us-east-1';
//var credentials = new AWS.SharedIniFileCredentials({profile: 'rds-snapshot-deleter'});
//AWS.config.credentials = credentials;

var rds = new AWS.RDS();
var numberOfSnapshotsToKeep = 5;
var identifier = 'production';

/**
 * Deletes all but the latest numberOfSnapshotsToKeep RDS snapshots that match the
 * identifier specified above. Ignores any snapshots with 'retain' in their
 * names, automated snapshots, and snapshots that are still being created.
 *
 * Note: this is intended to run as an AWS Lambda function on the backup AWS account.
 * This is *not* automatically deployed when it is changed, it needs to be manually
 * placed on the backup account by someone that has access (talk to Jeremy for details).
 * The Lambda function that this is attached to can be run as often as desired, as this
 * is idempotent, but once a day is fine, that's how often backups are backed up.
 */
exports.handler = function (event, context, callback) {
    // In this particular situation, we know that there will never be very many
    // snapshots, so we don't filter anything at the API level
    var params = {};
    rds.describeDBSnapshots(params, function (err, data) {
        var snapshots = data.DBSnapshots;
        var snapshotsToDelete = getSnapshotsToDelete(snapshots);
        console.log('Deleting ' + snapshotsToDelete.length + ' snapshots');
        deleteSnapshots(snapshotsToDelete);
        callback(null, "success");
    });

    // Delete each of the snapshots in the list
    var deleteSnapshots = function (snapshots) {
        var snapshotCount = snapshots.length;
        for (var i=0; i<snapshotCount; ++i) {
            var params = {
                DBSnapshotIdentifier: snapshots[i].DBSnapshotIdentifier
            };
            console.log('Deleting snapshot with ID ' + snapshots[i].DBSnapshotIdentifier);
            rds.deleteDBSnapshot(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log("Deletion successful: " + JSON.stringify(data));
                }
            });
        }
    };

    // Don't delete anything with 'retain' in the name or any automated snapshots
    var snapshotFilterFunction = function (snapshot) {
        return snapshot.DBSnapshotIdentifier.indexOf('retain') === -1
            && snapshot.DBSnapshotIdentifier.indexOf(identifier) !== -1
            && snapshot.Status === 'available'
            && snapshot.SnapshotType === 'manual';
    };

    // Orders newer snapshots first
    var snapshotSortFunction = function (a, b) {
        return b.SnapshotCreateTime - a.SnapshotCreateTime;
    };

    // Assumes snapshot list is sorted, newest to oldest
    var getAllButNewestNSnapshots = function (n, snapshotList) {
        return snapshotList.slice(n);
    };

    var getSnapshotsToDelete = function (unfilteredUnsortedList) {
        var filtered = unfilteredUnsortedList.filter(snapshotFilterFunction);
        var filteredAndSorted = filtered.sort(snapshotSortFunction);
        return getAllButNewestNSnapshots(numberOfSnapshotsToKeep, filteredAndSorted);
    };
};
