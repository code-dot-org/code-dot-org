drop table if exists analysis.csf_plugged_stage_counts;
create table analysis.csf_plugged_stage_counts (
script_id int,
plugged_stage_counts int
);

insert into analysis.csf_plugged_stage_counts values
(1,9),
(17,11),
(18,11),
(19,14),
(23,16),
(236,5),
(237,6),
(238,9),
(239,12),
(240,8),
(241,10),
(258,19),
(259,7);

GRANT ALL PRIVILEGES ON analysis.csf_plugged_stage_counts TO GROUP admin;
GRANT SELECT ON analysis.csf_plugged_stage_counts TO GROUP reader, GROUP reader_pii;
