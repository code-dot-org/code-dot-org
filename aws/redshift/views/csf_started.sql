create or replace view analysis.csf_started as
select 
  us.script_id, 
  coalesce(sn.script_name_short, sc.name) script_name,
  us.user_id, 
  started_at,
  last_progress_at
from dashboard_production.user_scripts us
  join dashboard_production.scripts sc on sc.id = us.script_id
  left join analysis.script_names sn on sn.versioned_script_id = sc.id
  join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
where 
(
  sc.name in 
  (
    '20-hour',
    'course1',
    'course2',
    'course3',
    'course4'
  )
  or sn.script_name_long in 
  (
    'Course A',
    'Course B',
    'Course C',
    'Course D',
    'Course E',
    'Course F',
    'Express',
    'Pre-Express'
  )
)
and us.started_at is not null
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csf_started TO GROUP admin;
GRANT SELECT ON analysis.csf_started TO GROUP reader, GROUP reader_pii;
