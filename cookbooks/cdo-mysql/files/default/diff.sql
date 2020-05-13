-- Return count of changed rows (where `mysql_servers` is different from `runtime_mysql_servers`).
-- (Simulate FULL OUTER JOIN using a UNION of LEFT OUTER JOINs.)
SELECT COUNT(*) AS diff
FROM (
  SELECT *
  FROM `mysql_servers`
    LEFT OUTER JOIN `runtime_mysql_servers`
    USING (hostgroup_id, hostname, weight)
  WHERE `runtime_mysql_servers`.hostgroup_id IS NULL
  UNION ALL
  SELECT *
  FROM `runtime_mysql_servers`
    LEFT OUTER JOIN `mysql_servers`
    USING (hostgroup_id, hostname, weight)
  WHERE `mysql_servers`.hostgroup_id IS NULL
);
