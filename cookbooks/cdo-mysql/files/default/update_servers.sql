-- This script maintains 'fallback' servers within reader hostgroups
-- by setting `weight` values high for primary and low for fallback servers.
--
-- * HG0 (writer) and HG1 (reader) are hostgroups managed by existing monitors.
-- * HG1 weights are updated to favor readers with a fallback to the writer.
-- * HG2 is created as a 'primary-reader' hostgroup, with the same servers as HG1
--   but weights inverted, so it favors the writer with a fallback to readers.
-- * HG3 is a reporting-reader hostgroup with instances isolated from regular read/write splitting.

-- Note: although the ProxySQL admin interface uses the MySQL client protocol,
-- it uses the SQLite dialect for its SQL-query syntax.

-- Set HG2 copied from HG1.
REPLACE INTO `mysql_servers` (hostgroup_id, hostname, port, status, weight)
    SELECT 2, hostname, port, status, weight FROM `mysql_servers` WHERE `hostgroup_id` = 1;

-- Update weights on servers.
UPDATE `mysql_servers` SET `weight` = CASE
  WHEN ( -- If row is a writer (hostname in HG0)
    `hostname` IN (SELECT `hostname` FROM `mysql_servers` WHERE (`hostgroup_id` = 0))
  ) THEN
    -- Set writer weight low for HG1, high for HG2.
    CASE WHEN (`hostgroup_id` = 1) THEN 1 ELSE 10000000 END
  WHEN ( -- If row is a reporting-reader (hostname in HG3)
    `hostname` IN (SELECT `hostname` FROM `mysql_servers` WHERE (`hostgroup_id` = 3))
  ) THEN
    1 -- Set reporting-reader weight low for all HG.
  ELSE
    -- Set reader weight high for HG1, low for HG2.
    CASE WHEN (`hostgroup_id` = 1) THEN 10000000 ELSE 1 END
  END;
