drop table if exists analysis_pii.regional_partner_stats_csp_csd;

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
pd_enrollments_2016 as
  ( select u.studio_person_id, 
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
      where school_year = '2016-17'
 ),
teachers_trained_2017 as
(
select tt17.*, u.studio_person_id
  FROM analysis_pii.teachers_trained_2017 tt17
  JOIN dashboard_production.users u 
    ON tt17.user_id = u.id
)      
  SELECT distinct 
         d.studio_person_id,
         coalesce(tt18.first_name, tt17.first_name, pd16.first_name) as first_name,
         coalesce(tt18.last_name, tt17.last_name, pd16.last_name) as last_name,
         coalesce(tt18.email, tt17.email, pd16.email) as email,
         d.course,
         d.school_year as school_year_trained,
         s.school_year as school_year_taught,
         CASE WHEN rp.name is null THEN 'No Partner' ELSE rp.name END as regional_partner_name,
         rp.id as regional_partner_id,
         d.school_id school_id,
         ss_summer_pd.school_name school_name,
         ss_summer_pd.city city,
         ss_summer_pd.state state,
         ss_summer_pd.school_district_name school_district_name,
         ss_summer_pd.school_district_id school_district_id,
         ss_summer_pd.high_needs high_needs,
         ss_summer_pd.rural rural,
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
  LEFT JOIN analysis_pii.teachers_trained_2018 tt18
        ON d.studio_person_id = tt18.studio_person_id
  LEFT JOIN teachers_trained_2017 tt17
        ON d.studio_person_id = tt17.studio_person_id
  LEFT JOIN pd_enrollments_2016 pd16
        ON d.studio_person_id = pd16.studio_person_id
  -- schools
  LEFT JOIN analysis.school_stats ss_summer_pd 
         ON ss_summer_pd.school_id = d.school_id
  -- attendance
  LEFT JOIN analysis.quarterly_workshop_attendance qwa 
         ON qwa.studio_person_id = d.studio_person_id
        AND qwa.course = d.course 
        AND qwa.school_year = d.school_year
--pii tables (regional partner names, person names, emails, locations)
  LEFT JOIN dashboard_production_pii.regional_partners rp  
       ON d.regional_partner_id = rp.id 
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
