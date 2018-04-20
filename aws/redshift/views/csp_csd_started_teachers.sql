create or replace view analysis.csp_csd_started_teachers as
select 
  user_id,
  course_name,
  school_year, 
  max(case when started_at_order = 5 then started_at else null end) as started_at,
  max(case when started_at_order >= 5 then last_progress_at else null end) as last_progress_at
from
(
  select 
    se.user_id,
    course_name, 
    sy.school_year,
    st.started_at::date as started_at,
    st.last_progress_at::date as last_progress_at,
    row_number() over(partition by course_name, se.user_id, sy.school_year order by st.started_at asc) started_at_order
  from analysis.csp_csd_started st
    join analysis.school_years sy on st.started_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = st.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id 
      and (
        (se.course_id = 14 or se.course_id = 15) 
        or se.script_id in (select script_id from analysis.course_structure where course_name in ('csp','csd')) 
        or (se.course_id is null and se.script_id is null)
      )
)
group by 1,2,3
having max(started_at_order) >= 5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_started_teachers TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_started_teachers TO GROUP reader, GROUP reader_pii;

select top 100 * from analysis.csp_csd_started_teachers
