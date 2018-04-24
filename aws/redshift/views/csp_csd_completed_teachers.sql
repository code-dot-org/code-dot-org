create or replace view analysis.csp_csd_completed_teachers as
select 
  user_id,
  school_year, 
  course_name,
  completed_at
from
(
  select 
    se.user_id, 
    com.school_year,
    course_name,
    completed_at::date,
    row_number() over(partition by se.user_id, com.school_year order by completed_at asc) completed_at_order
  from analysis.csp_csd_completed com
    join analysis.school_years sy on com.completed_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = com.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id
      and (
        (se.course_id = 14 or se.course_id = 15) 
        or se.script_id in (select script_id from analysis.course_structure where course_name in ('csp','csd')) 
        or (se.course_id is null and se.script_id is null)
      )
)
where completed_at_order = 5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_completed_teachers TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_completed_teachers TO GROUP reader, GROUP reader_pii;
