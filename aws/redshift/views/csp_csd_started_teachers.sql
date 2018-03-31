create or replace view analysis.csp_csd_started_teachers as
select 
  user_id,
  course_name,
  school_year, 
  started_at
from
(
  select 
    se.user_id,
    course_name, 
    sy.school_year,
    st.started_at::date,
    row_number() over(partition by course_name, se.user_id, sy.school_year order by st.started_at asc) started_at_order
  from analysis.csp_csd_started st
    join analysis.school_years sy on st.started_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = st.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id
)
where started_at_order = 5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_started_teachers TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_started_teachers TO GROUP reader, GROUP reader_pii;
