drop view analysis.csf_completed_teachers;
create view analysis.csf_completed_teachers as
select 
  user_id,
  school_year, 
  script_id,
  script_name,
  completed_at
from
(
  select 
    se.user_id, 
    school_year,
    com.script_id,
    com.script_name,
    completed_at,
    row_number() over(partition by se.user_id, school_year order by completed_at asc) completed_at_order
  from analysis.csf_completed com
    join dashboard_production.followers f on f.student_user_id = com.user_id
    join dashboard_production.sections se on se.id = f.section_id
      and (se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) or se.script_id is null)
)
where completed_at_order = 5
with no schema binding; 

GRANT ALL PRIVILEGES ON analysis.csf_completed_teachers TO GROUP admin;
GRANT SELECT ON analysis.csf_completed_teachers TO GROUP reader, GROUP reader_pii;
