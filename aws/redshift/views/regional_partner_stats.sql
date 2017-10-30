CREATE OR REPLACE VIEW analysis_pii.regional_partner_stats AS
  SELECT d.course,
         d.location,
         d.user_id,
         d.first_name,
         d.last_name,
         d.email,
         d.school_id,
         d.regional_partner,
         d.regional_partner_id,
         u.current_sign_in_at,
         ss.school_name,
         ss.city,
         ss.state,
         ss.school_district_name,
         ss.school_district_id,
         ss.high_needs,
         qwa.q1,
         qwa.q2,
         qwa.q3,
         qwa.q4,
         tmp.script_most_progress,
         tmp.students_script_most_progress,
         sa.sections,
         sa.students,
         sa.students_female,
         sa.students_gender,
         sa.students_urm,
         sa.students_black,
         sa.students_hispanic,
         sa.students_native,
         sa.students_hawaiian,
         sa.students_race
  FROM analysis_pii.teachers_trained_2017 d
  LEFT JOIN dashboard_production_pii.users u 
         ON d.user_id = u.id
  LEFT JOIN analysis.school_stats ss 
         ON ss.school_id = d.school_id
  LEFT JOIN analysis.quarterly_workshop_attendance qwa
         ON qwa.user_id = d.user_id
        AND qwa.course = d.course
  LEFT JOIN analysis.teacher_most_progress tmp 
         ON tmp.user_id = d.user_id
  LEFT JOIN analysis.student_activity sa 
         ON sa.user_id = d.user_id
WITH NO SCHEMA binding;

GRANT ALL PRIVILEGES ON analysis_pii.regional_partner_stats TO GROUP admin;
GRANT SELECT ON analysis_pii.regional_partner_stats TO GROUP reader_pii;
