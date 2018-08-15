drop table if exists analysis.school_years;
create table analysis.school_years (
school_year varchar,
school_year_int int,
started_at timestamp,
ended_at timestamp
);

insert into analysis.school_years values
('2013-14', 2013, '2013-07-01 00:00:00', '2014-06-30 23:59:59'),
('2014-15', 2014,  '2014-07-01 00:00:00', '2015-06-30 23:59:59'),
('2015-16', 2015,  '2015-07-01 00:00:00', '2016-06-30 23:59:59'),
('2016-17', 2016,  '2016-07-01 00:00:00', '2017-06-30 23:59:59'),
('2017-18', 2017,  '2017-07-01 00:00:00', '2018-06-30 23:59:59'),
('2018-19', 2018,  '2018-07-01 00:00:00', '2019-06-30 23:59:59'),
('2019-20', 2019,  '2019-07-01 00:00:00', '2020-06-30 23:59:59');

GRANT ALL PRIVILEGES ON analysis.school_years TO GROUP admin;
GRANT SELECT ON analysis.school_years TO GROUP reader, GROUP reader_pii;
