drop table if exists analysis.school_years;
create table analysis.school_years (
school_year varchar,
school_year_int int,
started_at date,
ended_at date
);

insert into analysis.school_years values
('2013-14', 2013, '2013-07-01', '2014-07-01'),
('2014-15', 2014,  '2014-07-01', '2015-07-01'),
('2015-16', 2015,  '2015-07-01', '2016-07-01'),
('2016-17', 2016,  '2016-07-01', '2017-07-01'),
('2017-18', 2017,  '2017-07-01', '2018-07-01'),
('2018-19', 2018,  '2018-07-01', '2019-07-01'),
('2019-20', 2019,  '2019-07-01', '2020-07-01');

GRANT ALL PRIVILEGES ON analysis.school_years TO GROUP admin;
GRANT SELECT ON analysis.school_years TO GROUP reader, GROUP reader_pii;
