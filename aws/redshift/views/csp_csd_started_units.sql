DROP VIEW IF EXISTS analysis.csp_csd_started_units CASCADE;

create or replace view analysis.csp_csd_started_units as
select 
  user_id,
  course_id, 
  course_name_short as course_name, 
  sn.script_name_short as script_name, 
  sy.school_year, 
  min(us.started_at)::date started_at,
  max(us.last_progress_at)::date last_progress_at
from analysis.course_structure cs
  join analysis.script_names sn
      on sn.versioned_script_id = cs.script_id
  join dashboard_production.user_scripts us 
      on us.script_id = cs.script_id
  join dashboard_production.users u 
      on u.id = us.user_id 
      and u.user_type = 'student'
  join analysis.school_years sy 
      on us.started_at between sy.started_at and sy.ended_at
where cs.course_name_long in ('CS Discoveries','CS Principles')
  and us.started_at is not null
group by 1,2,3,4,5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_started_units TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_started_units TO GROUP reader, GROUP reader_pii;


