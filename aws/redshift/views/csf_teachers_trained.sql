-- the first date a teacher was trained in CSF
-- for teachers trained using old PD model, only resolving to the month
create or replace view analysis.csf_teachers_trained as
select 
  user_id, 
  min(trained_at) trained_at    
from
(
  SELECT DISTINCT 
    f.student_user_id user_id, 
    date_trunc('month', se.created_at)::date trained_at
  FROM dashboard_production.followers f
    JOIN dashboard_production.sections se ON se.id = f.section_id
  WHERE se.section_type = 'csf_workshop'

  UNION ALL

  SELECT DISTINCT 
    pde.user_id, 
    pds.start::date trained_at
  FROM dashboard_production_pii.pd_enrollments pde
    JOIN dashboard_production_pii.pd_attendances pda ON pda.pd_enrollment_id = pde.id
    JOIN dashboard_production_pii.pd_workshops pdw ON pdw.id = pde.pd_workshop_id
  JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
  WHERE course = 'CS Fundamentals'
)
group by 1
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csf_teachers_trained TO GROUP admin;
GRANT SELECT ON analysis.csf_teachers_trained TO GROUP reader, GROUP reader_pii;
