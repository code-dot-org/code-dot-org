drop table if exists analysis.outreach_stats;
CREATE table analysis.outreach_stats AS
  SELECT 'State' region_type,
         ug.state region,
         ug.state state,
         school_year,
         -- DATE_PART(year,us.created_at::DATE) AS year,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN f.student_user_id ELSE NULL END),0) pct_female,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN f.student_user_id ELSE NULL END),0) pct_urm,
         COUNT(DISTINCT CASE WHEN up.basic_proficiency_at IS NOT NULL THEN f.student_user_id ELSE NULL END) students_proficient,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN sc.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro') THEN f.student_user_id ELSE NULL END) students_hoc
  FROM dashboard_production_pii.users u
    JOIN dashboard_production_pii.user_geos ug 
      ON ug.user_id = u.id
    JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    JOIN dashboard_production.user_scripts us 
      ON us.user_id = f.student_user_id
    JOIN dashboard_production.scripts sc 
      ON sc.id = se.script_id
    JOIN dashboard_production_pii.users u_students 
      ON u_students.id = us.user_id
    LEFT JOIN dashboard_production.user_proficiencies up 
      ON up.user_id = u_students.id
     JOIN analysis.school_years sy on us.created_at between sy.started_at and sy.ended_at
  WHERE country = 'United States'
  AND   u_students.current_sign_in_at IS NOT NULL
  AND   u_students.user_type = 'student'
  AND   ug.state IS NOT NULL
  GROUP BY 1,2,3,4
  UNION ALL
  SELECT 'City' region_type,
         ug.city|| ', ' ||ug.state region,
         ug.state state,
         -- DATE_PART(year,us.created_at::DATE) AS year,
        school_year,         
        COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN f.student_user_id ELSE NULL END),0) pct_female,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN f.student_user_id ELSE NULL END),0) pct_urm,
         COUNT(DISTINCT CASE WHEN up.basic_proficiency_at IS NOT NULL THEN f.student_user_id ELSE NULL END) students_proficient,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN sc.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro') THEN f.student_user_id ELSE NULL END) students_hoc
  FROM dashboard_production_pii.users u
    JOIN dashboard_production_pii.user_geos ug 
      ON ug.user_id = u.id
    JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    JOIN dashboard_production.user_scripts us 
      ON us.user_id = f.student_user_id
    JOIN dashboard_production.scripts sc 
      ON sc.id = se.script_id
    JOIN dashboard_production_pii.users u_students 
      ON u_students.id = us.user_id
    LEFT JOIN dashboard_production.user_proficiencies up 
      ON up.user_id = u_students.id
    JOIN analysis.school_years sy on us.created_at between sy.started_at and sy.ended_at
  WHERE country = 'United States'
  AND   u_students.current_sign_in_at IS NOT NULL
  AND   u_students.user_type = 'student'
  AND   ug.city IS NOT NULL
  AND   ug.state IS NOT NULL
  GROUP BY 1,2,3,4
  ;

GRANT ALL PRIVILEGES ON analysis.outreach_stats TO GROUP admin;
GRANT SELECT ON analysis.outreach_stats TO GROUP reader, GROUP reader_pii;
