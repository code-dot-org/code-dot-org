-- % CSF PD teachers at high needs schools
select 
  avg(high_needs::float), 
  count(*), 
   '% CSF PD teachers at high needs schools' as metric, 
   1 as sort
from
(
SELECT distinct
       pda.teacher_id,
       high_needs
FROM dashboard_production_pii.pd_workshops pdw
  JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
  JOIN dashboard_production_pii.pd_enrollments pde ON pdw.id = pde.pd_workshop_id
  JOIN dashboard_production_pii.pd_attendances pda ON pda.pd_session_id = pds.id and pda.pd_enrollment_id = pde.id
  JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
  JOIN school_stats ss ON ss.school_id = si.school_id
WHERE pdw.course = 'CS Fundamentals'
AND   DATE_PART(year,start) = date_part(year,(dateadd(year, -1, getdate())))
and   high_needs is not null
)

union all
-- % CSF PD teachers at rural schools
select 
  avg(rural::float), 
  count(*), 
  '% CSF PD teachers at rural schools' as metric, 
  2 as sort
from
(
SELECT distinct
       pda.teacher_id,
       rural
FROM dashboard_production_pii.pd_workshops pdw
  JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
  JOIN dashboard_production_pii.pd_enrollments pde ON pdw.id = pde.pd_workshop_id
  JOIN dashboard_production_pii.pd_attendances pda ON pda.pd_session_id = pds.id and pda.pd_enrollment_id = pde.id
  JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
  JOIN school_stats ss ON ss.school_id = si.school_id
WHERE pdw.course = 'CS Fundamentals'
AND   DATE_PART(year,start) = date_part(year,(dateadd(year, -1, getdate())))
and   rural is not null
);

0.5735617442286551	10916	% CSF PD teachers at high needs schools	1
0.28091576062936446	11313	% CSF PD teachers at rural schools	2
