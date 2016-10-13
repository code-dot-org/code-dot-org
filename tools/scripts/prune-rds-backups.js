var AWS = require('aws-sdk');

// For local testing, credentials are not pre-supplied
//
//AWS.config.region = 'us-east-1';
//var credentials = new AWS.SharedIniFileCredentials({profile: 'rds-snapshot-deleter'});
//AWS.config.credentials = credentials;

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
    var test = event['test'] === true;

    var rds = new AWS.RDS();

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

    /************* Tests *************/

    /*
    To run, test the Lambda function with the following input:
     {
        "test": true
     }
    */

    var runTests = function () {
        console.log("Running tests");
        testSnapshotFilter();
        testGetSnapshotsToDelete();
    };

    var assertTrue = function (boolValue, message) {
        if (!boolValue) {
            console.log("Failed test: " + message);
            callback(message);
        } else {
            console.log("Passed test: " + message);
        }
    };

    var testGetSnapshotsToDelete = function () {
        var snapshots = [
            {
                'DBSnapshotIdentifier': 'production-snapshot-0',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(100)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-1',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(12)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-2',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(15)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-3',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(13)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-4',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(200)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-retain',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(1)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-skip',
                'Status': 'çreating',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(2)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-skip-2',
                'Status': 'available',
                'SnapshotType': 'automatic',
                'SnapshotCreateTime': new Date(3)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-5',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(300)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-6',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(250)
            },
            {
                'DBSnapshotIdentifier': 'production-snapshot-7',
                'Status': 'available',
                'SnapshotType': 'manual',
                'SnapshotCreateTime': new Date(20)
            }
        ];
        var expected = [
            'production-snapshot-2',
            'production-snapshot-3',
            'production-snapshot-1'
        ];
        var toDelete = getSnapshotsToDelete(snapshots);
        var deleteCount = toDelete.length;
        for (var i = 0; i < deleteCount; ++i) {
            assertTrue(toDelete[i].DBSnapshotIdentifier === expected[i],
                'Expected ' + expected[i] + ', got ' + toDelete[i].DBSnapshotIdentifier
            );
        }
        assertTrue(deleteCount === expected.length, 'Expected ' + expected.length + ' elements, got ' + deleteCount);
    };

    var testSnapshotFilter = function () {
        var s = {
            'DBSnapshotIdentifier': 'production-snapshot-0',
            'Status': 'available',
            'SnapshotType': 'manual'
        };
        assertTrue(snapshotFilterFunction(s), "Filter should accept " + s.DBSnapshotIdentifier);
        s = {
            'DBSnapshotIdentifier': 'production-snapshot-0-retain',
            'Status': 'available',
            'SnapshotType': 'manual'
        };
        assertTrue(!snapshotFilterFunction(s), "Filter should reject snapshots marked 'retain'");
        s = {
            'DBSnapshotIdentifier': 'production-snapshot-0',
            'Status': 'creating',
            'SnapshotType': 'manual'
        };
        assertTrue(!snapshotFilterFunction(s), "Filter should reject snapshots that aren't 'available'");
        s = {
            'DBSnapshotIdentifier': 'production-snapshot-0',
            'Status': 'available',
            'SnapshotType': 'automatic'
        };
        assertTrue(!snapshotFilterFunction(s), "Filter should reject automatic snapshots");
    };

    if (test) {
        runTests();
    } else {
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
    }
};
