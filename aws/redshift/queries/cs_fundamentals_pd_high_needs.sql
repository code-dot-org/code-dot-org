-- % PD teachers at high needs schools
SELECT DATE_PART(YEAR,start) AS YEAR,
       DATE_PART(MONTH,start) AS MONTH,
       AVG(high_needs::FLOAT) pct_high_needs,
       COUNT(*)
FROM dashboard_production_pii.pd_workshops pdw
  JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
  JOIN dashboard_production_pii.pd_enrollments pde ON pdw.id = pde.pd_workshop_id
  JOIN dashboard_production_pii.pd_attendances pda ON pda.pd_enrollment_id = pde.id
  JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
  JOIN school_stats ss ON ss.school_id = si.school_id
WHERE pdw.course = 'CS Fundamentals'
AND   DATE_PART(month,start) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,start) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 1,
         2

