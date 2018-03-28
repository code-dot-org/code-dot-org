This is a collection of notes about known issues with `schools` and `school_infos` data.
Original doc is [here](https://docs.google.com/document/d/1db49R4ezbGGjD67jEfuoW4lxedNonmw9qo4E9TWxNdQ/edit#).

# School_info validation logic is confusing/hard to follow and sometimes wrong
* Two validation types: full or none. None does no validation other than checking that the zip code is a positive number if it was provided.
None is used in cases where we don’t want the friction of requiring users to enter complete information. 
If you set VALIDATION_NONE then you can create a school_info with all the fields set to nil.
But none like that in prod:
```
select count(*) from school_infos where country is null AND school_type is null and zip is null and state is null and school_district_id is null and school_district_other is null and school_district_name is null and school_id is null and school_other is null and school_name is null and full_address is null;
+----------+
| count(*) |
+----------+
|        0 |
+----------+
1 row in set (0.29 sec)
```
We do have 220 rows with just country set (149 distinct countries)
```
select count(*) from school_infos where school_type is null and zip is null and state is null and school_district_id is null and school_district_other is null and school_district_name is null and school_id is null and school_other is null and school_name is null and full_address is null;
+----------+
| count(*) |
+----------+
|      220 |
+----------+
1 row in set (0.24 sec)
```
```
select count(distinct(country)) from school_infos where school_type is null and zip is null and state is null and school_district_id is null and school_district_other is null and school_district_name is null and school_id is null and school_other is null and school_name is null and full_address is null;
+--------------------------+
| count(distinct(country)) |
+--------------------------+
|                      149 |
+--------------------------+
1 row in set (0.24 sec)
```
Full validation also won't allow you to set a school if the school_type is private. This is most likely because before October 2017 the schools table did not have private school data.

# School_info country is sometimes the two-character country code, sometimes the full country name. 
Country value is not checked at all in validation:none. 
Full validation only checks for value of ‘US’, not ‘United States’
```
select count(*) from school_infos where length(country) > 2;
+----------+
| count(*) |
+----------+
|     1650 |
+----------+
1 row in set (0.05 sec)
```

# School info denormalizes schools data (and sometimes is inconsistent!)
`school_infos` references `schools` and both tables have columns for `school_type`, `zip`, `state`, `school_district_id`, `name`, and `address` (although `address` is a single column in `school_infos` and separate columns for each line in `schools`.)
Historically there was nothing to enforce that these values matched. This was fixed in https://github.com/code-dot-org/code-dot-org/pull/18873 but there are still older rows where the inconsistency exists. There are six rows in `school_infos` where the `schools` data and `school_infos` data disagree. Two have a mismatch on the state, three have null district id in school_infos and one has `country='IT'` in `school_infos`. That last one is a school located in Milan, MI.
```
select si.country as c, s.id as school_id, si.id as si_id, s.school_district_id as s_sd_id, si.school_district_id as si_sd_id, s.state as s_st, si.state as si_st, s.school_type as s_type, si.school_type as si_type from schools s join school_infos si on s.id = si.school_id where (si.school_district_id is null and s.school_district_id is not null) or (si.school_district_id is not null and s.school_district_id is null) or si.school_district_id != s.school_district_id or s.state != si.state or si.state is null or s.school_type != si.school_type or si.school_type is null or si.country != 'US';
+------+--------------+-------+---------+----------+------+-------+---------+---------+
| c    | school_id    | si_id | s_sd_id | si_sd_id | s_st | si_st | s_type  | si_type |
+------+--------------+-------+---------+----------+------+-------+---------+---------+
| IT   | 262385006074 | 18012 | 2623850 |  2623850 | MI   | MI    | public  | public  |
| US   | 130066001991 | 49084 | 1300660 |     NULL | GA   | GA    | public  | public  |
| US   | 510225002415 | 70113 | 5102250 |  5102250 | MD   | VA    | public  | public  |
| US   | 63531010265  | 79718 |  635310 |     NULL | CA   | CA    | public  | public  |
| US   | 110007400409 | 82047 | 1100074 |  1100074 | DC   | MD    | charter | charter |
| US   | 482319002353 | 86891 | 4823190 |     NULL | TX   | TX    | public  | public  |
+------+--------------+-------+---------+----------+------+-------+---------+---------+
6 rows in set (0.32 sec)
```

# SchoolInfo validation logic requires you to specify a district, state, type, and country even if you specify a School which already has that info.
Ideally those fields would not be required if a school is provided. 
It is likely that there are code paths and queries that depend on having the denormalized data in the SchoolInfo object directly. Overriding the accessor methods to get these fields directly from the School would allow us to remove the denormalized data without breaking code access. To avoid breaking any other queries we would need to understand what queries exist (against the prod DB as well as the reporting DB and Redshift) and update them.
Inconsistency is now mostly fixed by checking in validation if there is a school id and, if so, copying the denormalized data from the School and  upgrading the validation type to full. We still need to eliminate places where we are sending in mismatched data in the first place. When that happens it gets logged to Honeybadger (https://app.honeybadger.io/projects/3240/faults/35428612). Once those errors are cleaned up, we ought to change school_info validation to fail if any other data is provided along with a school id.

# Multiple rows for same school_id in school_infos
When a school_info has an associated school there is no additional data in the school_info that isn’t in the school. You would expect there the be at most one school info for each school. This is not the case
```
select school_info_count, count(*) as number_of_schools from (select school_id, count(*) as school_info_count from school_infos where school_id is not null group by school_id) as counts group by school_info_count order by count(*) desc;
+-------------------+-------------------+
| school_info_count | number_of_schools |
+-------------------+-------------------+
|                 1 |             34923 |
|                 2 |             12793 |
|                 3 |                17 |
|                 4 |                 1 |
|                 5 |                 1 |
+-------------------+-------------------+
5 rows in set (0.15 sec)
```
There seem to be two main explanations for why we have multiple rows for the same school:
* The school_info deduplication logic uses the validation type as part of the match. This means that if you are trying to create a school_info for a school using full validation it will not match an existing row for that school with validation type ‘none’. This issue is effectively fixed going forward since we no longer create school_infos with validation type ‘none’ when there is an associated school.
* Deduplication needs to be explicitly called (it isn’t part of the model.) When it isn’t called we can create a additional row. This is the most likely explanation for the cases where we have more than two rows for a given school.

We do not fully understand the root cause of all of the duplicates. For most of the schools with exactly two rows in school_infos it seems to be cause by the issue where deduplication was checking the validation type so we'd end up with one row with validation none and one with validation full. For the cases where there are 3 or more school_infos for the same school many of those rows have the same values for all columns. It is possible that this is caused by duplicate form submissions. Deduplication isn't transactional so if two submissions are processed concurrently then they can both end up creating a row. Another possibility is that there is (or was) a code path that isn't explicitly calling the deduplication logic. 

# School info deduplication issues
* Deduplication is not part of the model and needs to be called explicitly.
* Deduplication was broken for a long time, resulting in accounts associated with an incorrect school info. See https://github.com/code-dot-org/code-dot-org/pull/19555

# Schools data is the result of merging multiple NCES data sources, including preliminary data
NCES data isn’t always consistent and includes duplicates (entries for the same school but with different ids)
12 rows only existed in the preliminary data file. These appear to be duplicates of other rows in that same file and were likely removed from the final file for that reason. Interestingly they do exist in the file with geographic information from that same year.
There are also ‘legitimate’ duplicates from within the final NCES data sets. 
Here’s an example where the same school has 9 different ids/rows:
```
select * from schools where name='FAIRVIEW ACCELERATED' AND city='SAN ANGELO' AND state='TX' AND zip='76904' AND address_line1='2405 FAIRVIEW SCHOOL RD';
+--------------+--------------------+----------------------+------------+-------+-------+-------------+---------------------+---------------------+-------------------------+---------------+---------------+-----------+-------------+-----------------+
| id           | school_district_id | name                 | city       | state | zip   | school_type | created_at          | updated_at          | address_line1           | address_line2 | address_line3 | latitude  | longitude   | state_school_id |
+--------------+--------------------+----------------------+------------+-------+-------+-------------+---------------------+---------------------+-------------------------+---------------+---------------+-----------+-------------+-----------------+
| 480930011322 |            4809300 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:20 | 2017-11-01 21:43:38 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 480930012897 |            4809300 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:20 | 2017-11-01 21:43:38 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390990 | -100.402461 | NULL            |
| 481149008475 |            4811490 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:21 | 2017-11-01 21:43:40 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 481401008049 |            4814010 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:22 | 2017-11-01 21:43:42 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 481807007228 |            4818070 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:26 | 2017-11-01 21:43:47 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 483738006035 |            4837380 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:43 | 2017-11-01 21:44:06 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 484155009027 |            4841550 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:46 | 2017-11-01 21:44:10 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 484404011050 |            4844040 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:47 | 2017-11-01 21:44:12 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
| 484441007083 |            4844410 | FAIRVIEW ACCELERATED | SAN ANGELO | TX    | 76904 | public      | 2016-10-25 22:08:47 | 2017-11-01 21:44:12 | 2405 FAIRVIEW SCHOOL RD | NULL          | NULL          | 31.390985 | -100.402850 | NULL            |
+--------------+--------------------+----------------------+------------+-------+-------+-------------+---------------------+---------------------+-------------------------+---------------+---------------+-----------+-------------+-----------------+
9 rows in set (0.00 sec)
```

This is especially confusing in the UI where all you see is the school name, city, state, and zip code. There is no way to know which is the “right” one to select. This is also why some of the bad ids have references (school_infos rows with those ids), making potential cleanup more complex than just deleting the extra rows.

Other example queries that show duplication:
```
select name, city, state, zip, address_line1, count(*) from schools group by name, city, state, zip, address_line1 having count(*) > 1 order by count(*);
201 rows in set (1.50 sec)
```
```
select name, latitude, longitude, count(*) from schools group by name, latitude, longitude  having count(*) > 1 order by count(*);
138 rows in set (2.83 sec)
```
```
select name, address_line1, count(*) from schools group by name, address_line1  having count(*) > 1 order by count(*);
215 rows in set (2.62 sec)
```
Sometimes the duplicates are really just NCES splitting the school based on grades offered. We should include school_stats_by_years when counting duplicates. It isn’t clear how to expose the differences among these schools in the UI. Today a user has no way to differentiate the elementary school from the middle school from the high school since they all share the same name and address.

Rather than simply merging in new NCES data each year we may want to consider a destroy and import approach for new data sets going forward. This will be tricky since we need to deal with existing references to any schools that do not exist in the new data file.

# The geographic data file we have does not have lat/long for all schools
```
select count(*) from schools where latitude is null;
+----------+
| count(*) |
+----------+
|     2294 |
+----------+
1 row in set (1.02 sec)
```

# State school ids need to be unique.
Because of the duplication of schools, we only load the state ids from most recent public/charter dataset. The result is that not all public and charter schools in our DB have a state school id set.

# School ids were initially imported as ints and later converted to strings, dropping leading zeros
This only applies to public and charter schools, not private schools. 
```
select school_type, length(id), count(*) from schools group by school_type, length(id);
+-------------+------------+----------+
| school_type | length(id) | count(*) |
+-------------+------------+----------+
| charter     |         11 |     2381 |
| charter     |         12 |     5205 |
| private     |          8 |    28129 |
| public      |         11 |    17375 |
| public      |         12 |    79920 |
+-------------+------------+----------+
5 rows in set (1.68 sec)
```
The rows with length 11 are the ones where the NCES id has a leading zero.
This can be a potential issue when loading new data. If zeros are not removed then it could create additional duplicates.

# Not every school has a record in school_stats_by_years
This seems to be because we have only imported the 2014-2015 data for public and charter schools and the 2015-2016 data for private schools. The schools without stats are spread out across school types.
```
select school_type, count(*) from schools s left join school_stats_by_years stats on s.id = stats.school_id where stats.grade_13_offered is not null group by school_type;
+-------------+----------+
| school_type | count(*) |
+-------------+----------+
| charter     |     7304 |
| private     |    22428 |
| public      |    95495 |
+-------------+----------+
3 rows in set (0.40 sec)
```

# Other complications
* There can legitimately be multiple schools with the exact same address (but different names.) This makes it challenging to match NCES data to other school ids (like college board school codes in AP data.)
* `school_stats_by_years` has no seeding. There are just oneoff scripts that can be used to load the data from files in S3.
* `school_districts` seeding uses a tsv file that is created by running oneoff scripts to load data from S3 and then exporting that data into a file which gets checked in
