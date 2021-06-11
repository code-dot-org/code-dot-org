----------------------------   historic_students (students started)

-- drop table ul_start;
create temporary table ul_start as (
select user_id, school_year, created_at act_dt, course_name, script_id, stage_id, level_id from (
	select ul.user_id, sy.school_year, ul.created_at, cs.course_name_true as course_name, cs.script_id, cs.stage_id, cs.level_id, rank () over (partition by user_id, school_year, course_name_true order by ul.created_at, level_script_order, level_number, ul.script_id, cs.stage_id) rnk  -----------------script id ordering 
	from dashboard_production.user_levels ul 
	join analysis.course_structure cs 
	on ul.script_id = cs.script_id and ul.level_id = cs.level_id 
	join analysis.school_years sy on ul.created_at between sy.started_at and sy.ended_at
	where ul.attempts > 0
	) 
where rnk = 1
);



-- drop table ul_end;
create temporary table ul_end as (
select user_id, school_year, created_at act_dt, course_name, script_id, stage_id, level_id from (
	select ul.user_id, sy.school_year, ul.created_at, cs.course_name_true as course_name, cs.script_id, cs.stage_id, cs.level_id, rank () over (partition by user_id, school_year, course_name_true order by ul.created_at desc, level_script_order desc,level_number desc, ul.script_id desc, cs.stage_id desc ) rnk  -----------------script id ordering 
	from dashboard_production.user_levels ul 
	join analysis.course_structure cs 
	on ul.script_id = cs.script_id and ul.level_id = cs.level_id 
	join analysis.school_years sy on ul.created_at between sy.started_at and sy.ended_at
	where ul.attempts > 0
	) 
where rnk = 1
);


-- drop table student_sections;
create temporary table student_sections as (
select distinct school_year, student_user_id, user_id as teacher_user_id, section_id from
	(select sy.school_year, f.student_user_id, s.user_id, s.id section_id, rank() over (partition by student_user_id, school_year order by f.created_at desc, s.first_activity_at desc, s.course_id desc, s.script_id desc) rnk  ------------- preferred order assumption
	from dashboard_production.followers f
	join dashboard_production.sections s on f.section_id = s.id  and first_activity_at <> '1970-01-01 00:00:00'
	join analysis.school_years sy on f.created_at between sy.started_at and sy.ended_at
) s
where rnk = 1
);  ---------------------------  only assigns one section per user per year



--  drop table vt1;
create temporary table students as (
select st.user_id as student_user_id, st.school_year, st.course_name, ht.school_id, ht.school_info_id, ht.school_name, sts.teacher_user_id, sts.section_id, 
case when st.course_name = 'csf' and csf_trained = 1 then 1
when st.course_name = 'csd' and csd_trained = 1 then 1
when st.course_name = 'csp' and csp_trained = 1 then 1
when st.course_name = 'hoc' and csf_trained = 1 then 1
else 0 end as teacher_trained,
st.script_id as start_script_id,
st.stage_id as start_stage_id,
st.level_id as start_level_id,
en.script_id as end_script_id,
en.stage_id as end_stage_id,
en.level_id as end_level_id
from ul_start st
join ul_end en on st.user_id = en.user_id and st.school_year = en.school_year and st.course_name = en.course_name
join dashboard_production_pii.users u on st.user_id = u.id  and u.user_type = 'student'
join dashboard_production.user_geos ug on u.id = ug.user_id and ug.country = 'United States'
left join student_sections sts on st.user_id = sts.student_user_id and st.school_year = sts.school_year
left join public.rosetta_historic_teachers ht on ht.teacher_user_id = sts.teacher_user_id and ht.school_year = st.school_year);


drop table public.rosetta_historic_students;
create table public.rosetta_historic_students as (select * from students);
grant select on public.rosetta_historic_students to group reader_pii;