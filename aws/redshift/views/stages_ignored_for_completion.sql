create or replace view analysis.stages_ignored_for_completion as
with unplugged_stages as 
(
  select distinct 
    cs.script_id, 
    cs.stage_number
  from analysis.course_structure cs
    join dashboard_production.levels le on le.id = cs.level_id
  -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
  where cs.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
    and le.type = 'Unplugged'
),
standalone_video_levels as
(
  select 
    cs.script_id, 
    cs.stage_number, 
    count(distinct le.id) levels,
    count(distinct case when le.type = 'StandaloneVideo' then le.id else null end) levels_standalone_video
  from analysis.course_structure cs
    join dashboard_production.levels le on le.id = cs.level_id
  -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
  where script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
  group by 1,2
),
standalone_video_stages as
(
  select 
    script_id, 
    stage_number
  from standalone_video_levels
  where levels = 1 
    and levels_standalone_video = 1
),
course_d_challenge_stages as
(
select distinct
  script_id,
  stage_number
from analysis.course_structure 
where stage_name like '%Super Challenge%' or stage_name like '%Extreme Challenge%'
and script_name = 'course4'
),
courses_e_f_ramp_stages as
(
select distinct
  script_id,
  stage_number
from analysis.course_structure 
where script_name in ('coursee', 'coursef') and stage_number <= 9
)
select *
from unplugged_stages

union

select *
from standalone_video_stages

union 

select *
from course_d_challenge_stages

union 

select *
from courses_e_f_ramp_stages
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.stages_ignored_for_completion TO GROUP admin;
GRANT SELECT ON analysis.stages_ignored_for_completion TO GROUP reader, GROUP reader_pii;
