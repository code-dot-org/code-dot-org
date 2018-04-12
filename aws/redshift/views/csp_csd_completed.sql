create or replace view analysis.csp_csd_completed as
select user_id, course_name, school_year, started_at::date as completed_at
from
(
  select user_id, course_name, school_year, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select user_id, cs.course_name, school_year, us.script_id, us.stage_id, us.started_at, row_number() over(partition by us.user_id, us.script_id order by us.started_at asc) stage_order
    from analysis.user_stages us
    join analysis.course_structure cs on cs.script_id = us.script_id
    join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
    join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
    where cs.course_name = 'csp'
  )
  where stage_order = 5
)
where script_order = 4
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_completed TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_completed TO GROUP reader, GROUP reader_pii;
