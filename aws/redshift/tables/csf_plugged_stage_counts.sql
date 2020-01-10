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
(23,12),  
(236,5),
(237,6),
(238,9),
(239,12),
(240,8),
(241,10),
(258,19),
(259,7),
(297,7),
(301,7),
(302,14),
(303,27),
(307,10),
(309,8),
(310,8),
(341,9),
-- 2019 courses
(369,7),
(370,6),
(366,10),
(360,12),
(361,13),
(357,13),
(363,27),
(371,12);

GRANT ALL PRIVILEGES ON analysis.csf_plugged_stage_counts TO GROUP admin;
GRANT SELECT ON analysis.csf_plugged_stage_counts TO GROUP reader, GROUP reader_pii;
