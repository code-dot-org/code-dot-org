create or replace view analysis.csf_started as
select 
  us.script_id, 
  sc.name script_name, 
  us.user_id, 
  started_at
from dashboard_production.user_scripts us
  join dashboard_production.scripts sc on sc.id = us.script_id
  join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
where sc.name in 
(
  '20-hour',
  'course1',
  'course2',
  'course3',
  'course4',
  'coursea',
  'courseb',
  'coursec',
  'coursed',
  'coursee',
  'coursef',
  'express',
  'pre-express'
)
  and us.started_at is not null
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csf_started TO GROUP admin;
GRANT SELECT ON analysis.csf_started TO GROUP reader, GROUP reader_pii;
