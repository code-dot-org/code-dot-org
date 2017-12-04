-- % PD teachers at high needs schools
SELECT DATE_PART(YEAR,start) AS YEAR,
                   DATE_PART(MONTH,start) AS MONTH,
                   avg(high_needs::float) pct_high_needs, count(*)
            FROM dashboard_production_pii.pd_workshops pdw
              JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
              JOIN dashboard_production_pii.pd_enrollments pde ON pdw.id = pde.pd_workshop_id
              join dashboard_production_pii.pd_attendances pda on pda.pd_enrollment_id = pde.id
              JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
              join school_stats ss on ss.school_id = si.school_id
            WHERE pdw.course = 'CS Fundamentals'
            group by 1,2
