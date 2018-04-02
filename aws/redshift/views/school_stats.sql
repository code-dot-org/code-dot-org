CREATE OR REPLACE VIEW analysis.school_stats AS
    SELECT schools.id                               AS school_id,
           schools.name                             AS school_name,
           schools.city                             AS city,
           schools.zip                              AS zip,
           schools.state                            AS state,
           schools.latitude                         AS latitude,
           schools.longitude                        AS longitude,
           schools.school_type                      AS school_type,
           schools.school_district_id               AS school_district_id,
           school_districts.name                    AS school_district_name,
           max_survey_years.survey_year             AS survey_year,
           school_stats_by_years.grades_offered_lo  AS grades_lo,
           school_stats_by_years.grades_offered_hi  AS grades_hi,
           (CASE WHEN grades_offered_lo is null then null
                 WHEN (grade_pk_offered +
                       grade_kg_offered +
                       grade_01_offered +
                       grade_02_offered +
                       grade_03_offered +
                       grade_04_offered +
                       grade_05_offered) > 0
                 THEN 1
                 WHEN grades_offered_lo in ('01','02','03','04','05','PK','KG') 
                 THEN 1 
                 ELSE 0 END)                        AS stage_el,
           (CASE WHEN grades_offered_lo is null then null
                 WHEN -- exclude K-6 and pre-K-6 schools from being classified as middle schools
                 ((grades_offered_lo = 'PK' and grades_offered_hi = '06') or (grades_offered_lo = 'KG' and grades_offered_hi = '06')) = 1
                 THEN 0                                   
                 WHEN (grade_06_offered +
                       grade_07_offered +
                       grade_08_offered) > 0
                 THEN 1
                 WHEN grades_offered_lo in ('06','07','08') OR grades_offered_hi in ('06','07','08')
                 THEN 1 
                 ELSE 0 END)                        AS stage_mi,
           (CASE WHEN grades_offered_lo is null then null
                 WHEN (grade_09_offered +
                       grade_10_offered +
                       grade_11_offered +
                       grade_12_offered +
                       grade_13_offered) > 0
                 THEN 1
                 WHEN grades_offered_hi in ('09','10','11','12')
                 THEN 1 
                 ELSE 0 END)                        AS stage_hi,
           school_stats_by_years.students_total     AS students,
           school_stats_by_years.student_am_count   AS student_am,
           school_stats_by_years.student_as_count   AS student_as,
           school_stats_by_years.student_hi_count   AS student_hi,
           school_stats_by_years.student_bl_count   AS student_bl,
           school_stats_by_years.student_wh_count   AS student_wh,
           school_stats_by_years.student_hp_count   AS student_hp,
           school_stats_by_years.student_tr_count   AS student_tr,
           ((student_am_count +
             student_hi_count +
             student_bl_count +
             student_hp_count) /
             students_total::float)                 AS urm_percent,
           school_stats_by_years.frl_eligible_total AS frl_eligible,
           (CASE WHEN frl_eligible_total IS NULL
                   OR students_total IS NULL
                   OR frl_eligible_total > students_total
                 THEN NULL
                 ELSE frl_eligible_total /
                       students_total::float END) AS frl_eligible_percent,           
           (CASE WHEN frl_eligible_total IS NULL
                   OR students_total IS NULL
                 THEN NULL
                 WHEN (frl_eligible_total /
                       students_total::float) > 0.5
                 THEN 1
                 ELSE 0 END)                      AS high_needs,
           school_stats_by_years.community_type   AS community_type
      FROM dashboard_production.schools
 LEFT JOIN dashboard_production.school_districts
        ON schools.school_district_id = school_districts.id
 LEFT JOIN (  SELECT MAX(school_year) AS survey_year,
                     school_id
                FROM dashboard_production.school_stats_by_years
            GROUP BY school_id) max_survey_years
        ON max_survey_years.school_id = schools.id
 LEFT JOIN dashboard_production.school_stats_by_years
        ON school_stats_by_years.school_id = schools.id
       AND school_stats_by_years.school_year = max_survey_years.survey_year
WITH NO SCHEMA BINDING;

GRANT ALL PRIVILEGES ON analysis.school_stats TO GROUP admin;
GRANT SELECT ON analysis.school_stats TO GROUP reader, GROUP reader_pii;
