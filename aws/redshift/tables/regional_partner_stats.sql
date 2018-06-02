drop table if exists analysis_pii.regional_partner_stats;
create table analysis_pii.regional_partner_stats AS
with completed as
(
  select 
    studio_person_id,
    case when cc.course_name = 'csp' then 'CS Principles'
         when cc.course_name in ('csd','csd_half') then 'CS Discoveries'
    end as course
  from csp_csd_completed_teachers cc
  join users u on u.id = cc.user_id
  where cc.school_year = '2017-18'
) 
  SELECT d.course,
         d.location,
         d.first_name,
         d.last_name,
         d.email,
         coalesce(d.school_id, ss_user.school_id) school_id,
         d.regional_partner,
         d.user_id,
         u.studio_person_id,
         coalesce(ss_summer_pd.school_name, ss_user.school_name) school_name,
         coalesce(ss_summer_pd.city, ss_user.city) city,
         coalesce(ss_summer_pd.state, ss_user.state) state,
         coalesce(ss_summer_pd.school_district_name, ss_user.school_district_name) school_district_name,
         coalesce(ss_summer_pd.school_district_id, ss_user.school_district_id) school_district_id,
         coalesce(ss_summer_pd.high_needs, ss_user.high_needs) high_needs,
         coalesce(ss_summer_pd.rural, ss_user.rural) rural,
         qwa.q1,
         qwa.q2,
         qwa.q3,
         qwa.q4,
         case when (q1 + q2 + q3 + q4) >= 3 then 1 else 0 end as retained,
         case when c.studio_person_id is not null then 1 else 0 end as completed,
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
  LEFT JOIN analysis.school_stats ss_summer_pd 
         ON ss_summer_pd.school_id = d.school_id
  LEFT JOIN dashboard_production.school_infos si_user
         ON si_user.id = u.school_info_id
  LEFT JOIN analysis.school_stats ss_user
         ON ss_user.school_id = si_user.school_id
  LEFT JOIN analysis.quarterly_workshop_attendance qwa
         ON qwa.studio_person_id = u.studio_person_id
        AND qwa.course = d.course -- only include attendance at the workshop for which you were trained
  LEFT JOIN analysis.teacher_most_progress tmp 
         ON tmp.studio_person_id = u.studio_person_id
  LEFT JOIN analysis.student_activity sa 
         ON sa.studio_person_id = u.studio_person_id
  LEFT JOIN completed c
         ON c.studio_person_id = u.studio_person_id
        AND c.course = d.course;

GRANT ALL PRIVILEGES ON analysis_pii.regional_partner_stats TO GROUP admin;
GRANT SELECT ON analysis_pii.regional_partner_stats TO GROUP reader_pii;
