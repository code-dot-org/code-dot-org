-- This script maintains 'fallback' servers within reader hostgroups
-- by setting `weight` values high for primary and low for fallback servers.
--
-- * HG0 (writer) and HG1 (reader) are hostgroups managed by existing monitors.
-- * HG1 weights are updated to favor readers with a fallback to the writer.
-- * HG2 is created as a 'primary-reader' hostgroup, with the same servers as HG1
--   but weights inverted, so it favors the writer with a fallback to readers.

-- Note: although the ProxySQL admin interface uses the MySQL client protocol,
-- it uses the SQLite dialect for its SQL-query syntax.

DELETE FROM `mysql_servers`;

-- Copy `runtime_mysql_servers` to `mysql_servers`, with HG2 copied from HG1.
INSERT INTO `mysql_servers` SELECT * FROM `runtime_mysql_servers` WHERE `hostgroup_id` != 2;
UPDATE `mysql_servers` SET `hostgroup_id` = 2 WHERE `hostgroup_id` = 1;
INSERT INTO `mysql_servers` SELECT * FROM `runtime_mysql_servers` WHERE `hostgroup_id` = 1;

-- Update weights on servers.
UPDATE `mysql_servers` SET `weight` = CASE
  WHEN ( -- Test if row is a writer (hostname exists in HG0)
    `hostname` IN (SELECT `hostname` FROM `mysql_servers` WHERE (`hostgroup_id` = 0))
  ) THEN
    -- Set writer weight low for HG1, high for HG2.
    CASE WHEN (`hostgroup_id` = 1) THEN 1 ELSE 10000000 END
  ELSE
    -- Set reader weight high for HG1, low for HG2.
    CASE WHEN (`hostgroup_id` = 1) THEN 10000000 ELSE 1 END
  END;

-- Return count of changed rows (where `mysql_servers` is different from `runtime_mysql_servers`).
-- (Simulate FULL OUTER JOIN using a UNION of LEFT OUTER JOINs.)
SELECT COUNT(*) AS diff FROM (
  SELECT * FROM `mysql_servers`
    LEFT OUTER JOIN `runtime_mysql_servers`
        USING (hostgroup_id, hostname, weight)
  WHERE `runtime_mysql_servers`.hostgroup_id IS NULL
UNION ALL
  SELECT * FROM `runtime_mysql_servers`
    LEFT OUTER JOIN `mysql_servers`
        USING (hostgroup_id, hostname, weight)
  WHERE `mysql_servers`.hostgroup_id IS NULL
);
