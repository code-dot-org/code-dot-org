-- No check on whether students actually made progress
-- Quick change: only include last year of activity
drop table if exists analysis.school_activity_stats;
CREATE table analysis.school_activity_stats AS
  SELECT ss.school_id,
         rpsd.regional_partner_id,
         case when rp.name = 'mindSpark Learning' then 'mindSpark Learning and Colorado Education Initiative' else rp.name end as regional_partner,
         ss.school_name,
         ss.city,
         ss.state,
         ss.zip,
         ss.school_type,
         ss.school_district_name,
         ss.stage_el AS elementary,
         ss.stage_mi AS middle,
         ss.stage_hi AS high,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN se.user_id ELSE NULL END) teachers_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN se.user_id ELSE NULL END) teachers_csp,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Principles' THEN u.id ELSE NULL END) teachers_csp_pd,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Discoveries' THEN u.id ELSE NULL END) teachers_csd_pd,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN f.student_user_id ELSE NULL END) students_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN csf_pd.user_id IS NOT NULL THEN u.id ELSE NULL END) teachers_csf_pd,
         COUNT(DISTINCT CASE WHEN scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball') THEN f.student_user_id ELSE NULL END) students_hoc
  FROM analysis.school_stats ss
    LEFT JOIN dashboard_production.school_infos si 
      ON ss.school_id = si.school_id
    LEFT JOIN dashboard_production_pii.users u
      ON si.id = u.school_info_id AND u.user_type = 'teacher'
    LEFT JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    LEFT JOIN dashboard_production.scripts scr 
      ON scr.id = se.script_id
    LEFT JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    LEFT JOIN dashboard_production_pii.users u_students
           ON u_students.id = f.student_user_id AND u_students.current_sign_in_at IS NOT NULL
    LEFT JOIN dashboard_production_pii.regional_partners_school_districts rpsd 
           ON rpsd.school_district_id = ss.school_district_id
    LEFT JOIN dashboard_production_pii.regional_partners rp 
           ON rp.id = rpsd.regional_partner_id
    LEFT JOIN analysis_pii.regional_partner_stats rpd 
           ON rpd.user_id = u.id
    LEFT JOIN (SELECT DISTINCT f.student_user_id user_id
               FROM dashboard_production.followers f
                 JOIN dashboard_production.sections se 
                   ON se.id = f.section_id
               WHERE se.section_type = 'csf_workshop'
               UNION
               SELECT DISTINCT pde.user_id
               FROM dashboard_production_pii.pd_enrollments pde
                 JOIN dashboard_production_pii.pd_attendances pda 
                   ON pda.pd_enrollment_id = pde.id
                 JOIN dashboard_production_pii.pd_workshops pdw 
                   ON pdw.id = pde.pd_workshop_id
               WHERE course = 'CS Fundamentals') csf_pd 
           ON csf_pd.user_id = u.id
  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12;

GRANT ALL PRIVILEGES ON analysis.school_activity_stats TO GROUP admin;
GRANT SELECT ON analysis.school_activity_stats TO GROUP reader, GROUP reader_pii;
