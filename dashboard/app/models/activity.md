# Table: Activity

A row in the **Activity** table contains information about an attempt on a level by a user.

## DESCRIBE activities

+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| id              | int(11)      | NO   | PRI | NULL    | auto_increment |
| user_id         | int(11)      | YES  | MUL | NULL    |                |
| level_id        | int(11)      | YES  |     | NULL    |                |
| action          | varchar(255) | YES  |     | NULL    |                |
| url             | varchar(255) | YES  |     | NULL    |                |
| created_at      | datetime     | YES  |     | NULL    |                |
| updated_at      | datetime     | YES  |     | NULL    |                |
| attempt         | int(11)      | YES  |     | NULL    |                |
| time            | int(11)      | YES  |     | NULL    |                |
| test_result     | int(11)      | YES  |     | NULL    |                |
| level_source_id | int(11)      | YES  | MUL | NULL    |                |
| lines           | int(11)      | NO   |     | 0       |                |
+-----------------+--------------+------+-----+---------+----------------+

## Fields

* id:
* user_id:
* level_id:
* action:
* url:
* created_at:
* updated_at:
* attempt:
* time:
* test_result:
* level_source_id:
* lines:  
