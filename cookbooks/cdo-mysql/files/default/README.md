# CDO Mysql Files

The sql queries in this cookbook contain important logic, so testing them is
important. There are not automated tests, but the following steps will allow you
to set up a local testing environment.

Note that while AWS Aurora uses MySql syntax, the ProxySQL server uses SQLite
syntax.

## Manual testing

Create an ephemeral local sqlite instance.

```sh
docker run --rm -t keinos/sqlite3
```

Create a table.

```sql
CREATE TABLE `mysql_servers` (
  `hostgroup_id` int(11) DEFAULT NULL,
  `hostname` varchar(45) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  PRIMARY KEY (`hostgroup_id`, `hostname`));
```

Populate the table with a prod-like configuration.

```sql
INSERT INTO mysql_servers
VALUES
  (0, 'writer', 3306, 'fine', 10000000),
  (1, 'writer', 3306, 'fine', 1),
  (1, 'reader', 3306, 'fine', 10000000),
  (1, 'reporting', 3306, 'fine', 1),
  (2, 'writer', 3306, 'fine', 10000000),
  (2, 'reader', 3306, 'fine', 1),
  (2, 'reporting', 3306, 'fine', 1),
  (3, 'reporting', 3306, 'fine', 1);
```

Inspect the table.

```sql
SELECT * FROM mysql_servers;
```

Edit values and then run the queries in
[update_servers.sql](./update_servers.sql) to test the logic.
