const app = require("../prune-aurora-backups.js");
const chai = require("chai");
const assert = chai.assert;

const SNAPSHOTS = [
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-0",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(100)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-1",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(12)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-2",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(15)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-3",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(13)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-4",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(200)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-retain",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(1)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-skip",
    Status: "çreating",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(2)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-skip-2",
    Status: "available",
    SnapshotType: "automatic",
    SnapshotCreateTime: new Date(3)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-5",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(300)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-6",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(250)
  },
  {
    DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-7",
    Status: "available",
    SnapshotType: "manual",
    SnapshotCreateTime: new Date(20)
  }
];

describe("#getSnapshotsToDelete", function() {
  it("should return the 3 oldest snapshots out of 8 eligible and 3 ineligible snapshots", () => {
    const expected = [
      "autoscale-prod-cluster-snapshot-2",
      "autoscale-prod-cluster-snapshot-3",
      "autoscale-prod-cluster-snapshot-1"
    ];
    const idsToDelete = app
      .getSnapshotsToDelete(SNAPSHOTS)
      .map(s => s.DBClusterSnapshotIdentifier);

    assert.deepEqual(idsToDelete, expected);
  });
});

describe("#isSnapshotDeletionEligible", function() {
  it("should accept eligible snapshot", () => {
    const s = {
      DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-0",
      Status: "available",
      SnapshotType: "manual"
    };
    assert(app.isSnapshotDeletionEligible(s));
  });

  it("should reject snapshot that isn't 'available'", () => {
    const s = {
      DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-0",
      Status: "creating",
      SnapshotType: "manual"
    };
    assert.isFalse(app.isSnapshotDeletionEligible(s));
  });

  it('should reject snapshot marked with "retain"', () => {
    const s = {
      DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-0-retain",
      Status: "available",
      SnapshotType: "manual"
    };
    assert.isFalse(app.isSnapshotDeletionEligible(s));
  });

  it("should reject automatic snapshot", () => {
    const s = {
      DBClusterSnapshotIdentifier: "autoscale-prod-cluster-snapshot-0",
      Status: "available",
      SnapshotType: "automatic"
    };
    assert.isFalse(app.isSnapshotDeletionEligible(s));
  });
});
