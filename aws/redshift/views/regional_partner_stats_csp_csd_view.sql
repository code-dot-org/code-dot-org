create or replace view analysis_pii.regional_partner_stats_csp_csd_view 
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
names as
(
  select 
  	studio_person_id,
  	first_name,
  	last_name
  from
  (
  	select
  		studio_person_id,
  		first_name,
  		last_name,
  		row_number() over(partition by studio_person_id order by created_at desc) row_num
  	from
  	(
  		select
  			u.studio_person_id,
  			pde.first_name,
  			pde.last_name,
  			pde.created_at
  		from dashboard_production_pii.pd_enrollments pde
  		join dashboard_production_pii.users u on u.id = pde.user_id
  		where first_name is not null
  		and last_name is not null
		
  		union all
		
  		select 
  			u.studio_person_id,
  			json_extract_path_text(form_data, 'firstName') first_name,
  			json_extract_path_text(form_data, 'lastName') last_name,
  			pda.created_at
  		from dashboard_production_pii.pd_applications pda
  		join dashboard_production_pii.users u on u.id = pda.user_id
  		where json_extract_path_text(form_data, 'firstName') != ''
  		and json_extract_path_text(form_data, 'lastName') != ''
  	)
  )
  where row_num = 1
),
emails as
(
  select
  	studio_person_id,
  	listagg(distinct email, ', ') emails
  from dashboard_production_pii.users
  where user_type = 'teacher'
  group by 1
)
SELECT distinct 
       d.studio_person_id,
       n.first_name as first_name,
       n.last_name as last_name,
       e.emails as email,
       d.course, -- pd_course
       scholarship,
       d.school_year as school_year_trained,
       coalesce(sa_csp.school_year, sa_csd.school_year) as school_year_taught,
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
       qwa.q1_enrolled,
       qwa.q2_enrolled,
       qwa.q3_enrolled,
       qwa.q4_enrolled,
       case when (q1 + q2 + q3 + q4) >= 3 then 1 else 0 end as retained,
       case when c.studio_person_id is not null then 1 else 0 end as completed, -- completed course trained in
       case when s.studio_person_id is not null then 1 else 0 end as started, -- started course trained in (implementation)
       tmp_csp.script_most_progress script_most_progress_csp,
       tmp_csp.students_script_most_progress students_script_most_progress_csp,
       tmp_csd.script_most_progress script_most_progress_csd,
       tmp_csd.students_script_most_progress students_script_most_progress_csd,
       case when d.course = 'CS Principles' then tmp_csp.script_most_progress
            when d.course = 'CS Discoveries' then tmp_csd.script_most_progress
            end as script_most_progress,
       case when d.course = 'CS Principles' then tmp_csp.students_script_most_progress
            when d.course = 'CS Discoveries' then tmp_csd.students_script_most_progress
            end as students_script_most_progress,
       sa_csp.sections as sections_csp,
       sa_csp.students as students_csp,
       sa_csp.students_started as students_started_csp,
       sa_csp.students_completed as students_completed_csp,
       sa_csd.sections as sections_csd,
       sa_csd.students as students_csd,
       sa_csd.students_started as students_started_csd,
       sa_csd.students_completed as students_completed_csd,
       sa_csp.sections + sa_csd.sections as sections,
       sa_csp.students + sa_csd.students as students,
       sa_csp.students_started + sa_csd.students_started as students_started,
       sa_csp.students_completed + sa_csd.students_completed as students_completed,
       sa_csp.students_female + sa_csd.students_female as students_female,
       sa_csp.students_gender + sa_csd.students_gender as students_gender,
       sa_csp.students_urm + sa_csd.students_urm as students_urm,
       sa_csp.students_black + sa_csd.students_black as students_black,
       sa_csp.students_hispanic + sa_csd.students_hispanic as students_hispanic,
       sa_csp.students_native + sa_csd.students_native as students_native,
       sa_csp.students_hawaiian + sa_csd.students_hawaiian as students_hawaiian,
       sa_csp.students_race + sa_csd.students_race as students_race
FROM analysis.csp_csd_teachers_trained d
LEFT JOIN names n
      ON d.studio_person_id = n.studio_person_id
LEFT JOIN emails e
      ON d.studio_person_id = e.studio_person_id
-- schools
LEFT JOIN analysis.school_stats ss_summer_pd 
      ON ss_summer_pd.school_id = d.school_id
-- attendance
LEFT JOIN analysis.quarterly_workshop_attendance_view qwa 
      ON qwa.studio_person_id = d.studio_person_id
      AND qwa.course = d.course 
      AND qwa.school_year = d.school_year
--pii tables (regional partner names, person names, emails, locations)
LEFT JOIN dashboard_production_pii.regional_partners rp  
      ON d.regional_partner_id = rp.id 
-- analysis tables
LEFT JOIN analysis.student_activity_csp_csd_view sa_csp 
      ON sa_csp.studio_person_id = d.studio_person_id 
      AND sa_csp.school_year >= d.school_year 
      AND sa_csp.course_name_short = 'csp'
LEFT JOIN analysis.student_activity_csp_csd_view sa_csd 
      ON sa_csd.studio_person_id = d.studio_person_id 
      AND sa_csd.school_year >= d.school_year 
      AND sa_csd.course_name_short = 'csd'
LEFT JOIN started s
      ON s.studio_person_id = d.studio_person_id
      AND s.course = d.course
      AND s.school_year = coalesce(sa_csp.school_year, sa_csd.school_year)
LEFT JOIN completed c
      ON c.studio_person_id = d.studio_person_id
      AND c.course = d.course   
      AND c.school_year  = s.school_year  
LEFT JOIN analysis.teacher_most_progress_csp_csd_view tmp_csp 
      ON tmp_csp.studio_person_id = d.studio_person_id
      AND tmp_csp.school_year = coalesce(sa_csp.school_year, sa_csd.school_year)
      AND tmp_csp.course_name_short = 'csp'
LEFT JOIN analysis.teacher_most_progress_csp_csd_view tmp_csd 
      ON tmp_csd.studio_person_id = d.studio_person_id
      AND tmp_csd.school_year = coalesce(sa_csp.school_year, sa_csd.school_year)
      AND tmp_csd.course_name_short = 'csd'
with no schema binding

GRANT SELECT ON analysis_pii.regional_partner_stats_csp_csd_view TO reader_pii;
