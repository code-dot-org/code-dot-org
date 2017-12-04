-- % PD teachers at high needs schools
-- question of whether to filter only to those teachers who are in pd_attendances? 
-- Currently, stats are for all teachers who enrolled in PD, not necessarily only those in pd_attendances
SELECT year,
       month,
       AVG(high_needs::FLOAT) pct_high_needs,
       sum(high_needs) num_high_needs,
       sum(case when high_needs in (0,1) then 1 else 0 end) num_teachers_high_needs_data
FROM (SELECT CASE
               WHEN totfrl IS NULL OR total IS NULL THEN NULL
               WHEN totfrl::FLOAT/ total > 0.5 THEN 1
               ELSE 0
             END high_needs,
             CASE
               WHEN totfrl IS NULL OR total IS NULL THEN NULL
               ELSE totfrl::FLOAT/ total
             END pct_farm,
             total,
             totfrl,
             DATE_PART(YEAR,start) AS YEAR,
             DATE_PART(MONTH,start) AS MONTH,
             pd_workshop_id,
             pd_enrollment_id
      FROM (SELECT pdw.id pd_workshop_id,
                   pde.id pd_enrollment_id,
                   start,
                   CASE
                     WHEN pop.total = -1 OR pop.total = 0 THEN NULL
                     ELSE pop.total
                   END total,
                   CASE
                     WHEN sf.totfrl = -1 THEN NULL
                     ELSE sf.totfrl
                   END totfrl
            FROM dashboard_production_pii.pd_workshops pdw
              JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
              JOIN dashboard_production_pii.pd_enrollments pde ON pdw.id = pde.pd_workshop_id
              join dashboard_production_pii.pd_attendances pda on pda.pd_enrollment_id = pde.id
              LEFT JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
              LEFT JOIN public.bb_school_farm sf ON sf.ncessch::bigint = si.school_id::bigint
              LEFT JOIN public.bb_school_population pop ON pop.ncessch::bigint = sf.ncessch::bigint
            WHERE pdw.course = 'CS Fundamentals') TEMP) TEMP
GROUP BY 1,
         2;
