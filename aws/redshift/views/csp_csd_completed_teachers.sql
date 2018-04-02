create view analysis.csp_csd_completed_teachers as
select 
  user_id,
  school_year, 
  course_name,
  completed_at
from
(
  select 
    se.user_id, 
    school_year,
    course_name,
    completed_at::date,
    row_number() over(partition by se.user_id, school_year order by completed_at asc) completed_at_order
  from analysis.csp_csd_completed com
    join dashboard_production.followers f on f.student_user_id = com.user_id
    join dashboard_production.sections se on se.id = f.section_id
)
where completed_at_order = 5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_completed_teachers TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_completed_teachers TO GROUP reader, GROUP reader_pii;
