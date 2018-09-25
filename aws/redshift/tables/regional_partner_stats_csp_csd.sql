sdrop table if exists analysis_pii.regional_partner_stats_csp_csd;

create table analysis_pii.regional_partner_stats_csp_csd 
AS
with completed as
(
  select 
    studio_person_id,
    case when cc.course_name = 'csp' then 'CS Principles'
         when cc.course_name in ('csd','csd_half') then 'CS Discoveries'
    end as course,
    school_year
  from analysis.csp_csd_completed_teachers cc
  join dashboard_production_pii.users u on u.id = cc.user_id
), 
started as
(
  select 
    studio_person_id,
    case when cc.course_name = 'csp' then 'CS Principles'
         when cc.course_name in ('csd','csd_half') then 'CS Discoveries'
    end as course,
    school_year
  from analysis.csp_csd_started_teachers cc
  join dashboard_production_pii.users u on u.id = cc.user_id
),
pd_enrollments_with_year as
  ( select pd_workshop_id, u.studio_person_id, school_year,
         FIRST_VALUE(pde.first_name) OVER (PARTITION BY u.studio_person_id  ORDER BY (CASE WHEN  pde.first_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as first_name,
         FIRST_VALUE(pde.last_name) OVER (PARTITION BY u.studio_person_id ORDER BY (CASE WHEN  pde.last_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as last_name,
         FIRST_VALUE(pde.email) OVER (PARTITION BY u.studio_person_id ORDER BY (CASE WHEN  pde.email IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as email
      from dashboard_production_pii.pd_enrollments pde
      join dashboard_production.users u
      on u.id = pde.user_id
      join dashboard_production_pii.pd_workshops pw
      on pde.pd_workshop_id = pw.id
      join analysis.school_years sy 
      on pw.started_at between sy.started_at and sy.ended_at
      and pw.deleted_at is null and pde.deleted_at is null -- do these 'deleted_at's need to be changed?? probably... pd_workshops can be deleted and its okay?
  )
  SELECT distinct 
         d.studio_person_id,
         pde.first_name,
         pde.last_name,
         pde.email,
         d.course,
         d.school_year as school_year_trained,
         s.school_year as school_year_taught,
         CASE WHEN rp.name is null THEN 'No Partner' ELSE rp.name END as regional_partner_name,
         rp.id as regional_partner_id,
         coalesce(d.school_id, ss_user.school_id) school_id,
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
         case when s.studio_person_id is not null then 1 else 0 end as started,
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
  FROM analysis.csp_csd_teachers_trained d
  LEFT JOIN dashboard_production_pii.users u 
         ON d.studio_person_id = u.studio_person_id
  -- schools
  LEFT JOIN analysis.school_stats ss_summer_pd 
         ON ss_summer_pd.school_id = d.school_id
  LEFT JOIN dashboard_production.school_infos si_user
         ON si_user.id = u.school_info_id
  LEFT JOIN analysis.school_stats ss_user
         ON ss_user.school_id = si_user.school_id
  -- attendance
  LEFT JOIN analysis.quarterly_workshop_attendance qwa 
         ON qwa.studio_person_id = d.studio_person_id
        AND qwa.course = d.course -- only include attendance at the workshop for which you were trained (?? not sure what this note from Ben meant)
        AND qwa.school_year = d.school_year
--pii tables (regional partner names, person names, emails, locations)
  LEFT JOIN dashboard_production_pii.regional_partners rp  
       ON d.regional_partner_id = rp.id 
  LEFT JOIN pd_enrollments_with_year pde 
        ON pde.studio_person_id = d.studio_person_id
        AND pde.school_year = d.school_year 
-- analysis tables
 LEFT JOIN started s
       ON s.studio_person_id = d.studio_person_id
      AND s.course = d.course
      AND s.school_year >= d.school_year
  LEFT JOIN completed c
         ON c.studio_person_id = d.studio_person_id
        AND c.course = d.course   
        AND c.school_year  = s.school_year  
  LEFT JOIN analysis.teacher_most_progress_csp_csd tmp 
         ON tmp.studio_person_id = d.studio_person_id
         AND tmp.school_year = s.school_year
  LEFT JOIN analysis.student_activity_csp_csd sa 
         ON sa.studio_person_id = d.studio_person_id 
         AND sa.school_year = s.school_year
;

GRANT ALL PRIVILEGES ON analysis_pii.regional_partner_stats_csp_csd TO GROUP admin;
GRANT SELECT ON analysis_pii.regional_partner_stats_csp_csd TO GROUP reader_pii;
