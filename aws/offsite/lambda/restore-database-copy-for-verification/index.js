console.log('Loading function');

const AWS = require('aws-sdk');

const DB_INSTANCE_IDENTIFIER = process.env.DB_INSTANCE_IDENTIFIER;
const DB_SNAPSHOT_IDENTIFIER_PREFIX = process.env.DB_SNAPSHOT_IDENTIFIER_PREFIX;
const DB_AVAILABILITY_ZONE = process.env.DB_AVAILABILITY_ZONE;
const DB_SUBNET_GROUP_NAME = process.env.DB_SUBNET_GROUP_NAME;
const DB_INSTANCE_CLASS = process.env.DB_INSTANCE_CLASS;
const DB_OPTION_GROUP_NAME = process.env.DB_OPTION_GROUP_NAME;
const DB_PORT = process.env.DB_PORT;
const DB_STORAGE_TYPE = process.env.DB_STORAGE_TYPE;
const DB_ENGINE = process.env.DB_ENGINE;
const DB_LICENSE_MODEL = process.env.DB_LICENSE_MODEL;

exports.handler = (event, context, callback) => {
    console.log(JSON.stringify(event));
    var rds = new AWS.RDS();

    // Ignore snapshots with 'retain' in the name or any automated snapshots
    var snapshotFilterFunction = function (snapshot) {
        return snapshot.DBSnapshotIdentifier.indexOf('retain') === -1 &&
            snapshot.DBSnapshotIdentifier.indexOf(DB_SNAPSHOT_IDENTIFIER_PREFIX) !== -1 &&
            snapshot.Status === 'available' &&
            snapshot.SnapshotType === 'manual';
    };

    // Orders newer snapshots first
    var snapshotSortFunction = function (a, b) {
        return b.SnapshotCreateTime - a.SnapshotCreateTime;
    };


    var getMostRecentSnapshot = function (unfilteredUnsortedList) {
        var filtered = unfilteredUnsortedList.filter(snapshotFilterFunction);
        return filtered.sort(snapshotSortFunction)[0];
    };

    var params = {};
    rds.describeDBSnapshots(params, function (error, data) {
        var snapshots = data.DBSnapshots;
        var mostRecentSnapshot = getMostRecentSnapshot(snapshots);
        var restoreDBInstanceParameters = {
            DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
            DBSnapshotIdentifier: mostRecentSnapshot.DBSnapshotIdentifier,
            AutoMinorVersionUpgrade: true,
            AvailabilityZone: DB_AVAILABILITY_ZONE,
            DBSubnetGroupName: DB_SUBNET_GROUP_NAME,
            CopyTagsToSnapshot: false,
            DBInstanceClass: DB_INSTANCE_CLASS,
            EnableIAMDatabaseAuthentication: true,
            Engine: DB_ENGINE,
            LicenseModel: DB_LICENSE_MODEL,
            MultiAZ: false,
            OptionGroupName: DB_OPTION_GROUP_NAME,
            Port: DB_PORT,
            PubliclyAccessible: false,
            StorageType: DB_STORAGE_TYPE
        };
        console.log('About to initiate restore of database copy for verification from Snapshot: ' + mostRecentSnapshot.DBSnapshotIdentifier);
        rds.restoreDBInstanceFromDBSnapshot(restoreDBInstanceParameters, function (error, data) {
            if (error) {
                console.log(error, error.stack);
                callback(error);
            } else {
                console.log(data);
                callback(null, 'Successfully initiated restore of database copy for verification.');
            }
        });
    });
};
