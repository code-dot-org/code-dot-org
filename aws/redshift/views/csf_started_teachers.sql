create or replace view analysis.csf_started_teachers as
select 
  user_id,
  script_id,
  script_name,
  school_year, 
  max(case when started_at_order = 5 then started_at else null end) as started_at,
  max(case when started_at_order >= 5 then last_progress_at else null end) as last_progress_at
from
(
  select 
    se.user_id,
    st.script_id, 
    st.script_name,
    sy.school_year,
    st.started_at::date,
    st.last_progress_at::date as last_progress_at,
    row_number() over(partition by st.script_id, se.user_id, sy.school_year order by st.started_at asc) started_at_order
  from analysis.csf_started st
    join analysis.school_years sy on st.started_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = st.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id 
      and (se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) or se.script_id is null)
)
group by 1,2,3,4
having max(started_at_order) >= 5
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csf_started_teachers TO GROUP admin;
GRANT SELECT ON analysis.csf_started_teachers TO GROUP reader, GROUP reader_pii;
