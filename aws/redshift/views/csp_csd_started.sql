create or replace view analysis.csp_csd_started as
select 
  course_id, 
  course_name, 
  user_id, 
  sy.school_year, 
  min(us.started_at)::date started_at
from analysis.course_structure cs
  join dashboard_production.user_scripts us on us.script_id = cs.script_id
  join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
  join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
where cs.course_name in ('csd','csp')
  and us.started_at is not null
group by 1,2,3,4
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_started TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_started TO GROUP reader, GROUP reader_pii;
