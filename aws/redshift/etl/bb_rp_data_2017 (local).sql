-- attendance data from local workshops
-- partner based on who ran the workshop
drop table if exists #tc_teacher;
create temp table #tc_teacher as
select distinct
course,
'Local' as location,
pde.user_id,
pde.first_name,
pde.last_name,
pde.email,
case when pdw.id = 1114 then 2
when pdw.id = 1315 then 17
when pdw.id = 1948 then 44
else pdw.regional_partner_id
end regional_partner_id
from pd_enrollments pde
join pd_workshops pdw on pde.pd_workshop_id = pdw.id
join pd_attendances pda on pda.pd_enrollment_id = pde.id
where pde.email not like '%@code.org'
and subject = '5-day Summer'
and pdw.id not in (2462,2474)
and pde.deleted_at is null;

-- demographic info (e.g., school) about teachers from applications
drop table if exists #rp_teacher;
create temp table #rp_teacher as
select distinct user_id,
nullif(json_extract_path_text(application, 'school-district'),'')::int school_district_id,
json_extract_path_text(application, 'school') school_id,
sc.name school_name, sc.city, sc.state, sd.name school_district_name,
case
WHEN totfrl IS NULL OR total IS NULL THEN NULL
WHEN totfrl::FLOAT/ total > 0.5 THEN 1
ELSE 0 end high_needs
from pd_teacher_applications pdta
left join schools sc on sc.id = json_extract_path_text(application, 'school')
left join school_districts sd on sd.id = sc.school_district_id
left join public.bb_schools_additional sa on sa.ncessch = sc.id;

-- combine with non-static info (e.g., student progress)
drop table if exists #rp_data;
create temp table #rp_data as
select course, location, tct.user_id, first_name, last_name, tct.email, regional_partner_id, school_district_id, school_id,
school_name, rpt.city, rpt.state, school_district_name,
rp.name regional_partner,
u.current_sign_in_at,
qwa.q1, qwa.q2, qwa.q3, qwa.q4,
high_needs,
script_most_progress,
mp.students students_script_most_progress,
count(distinct se.id) sections,
count(distinct us.user_id) students,
count(distinct case when u_students.gender = 'f' then us.user_id else null end) students_female,
count(distinct case when u_students.gender in ('m','f') then us.user_id else null end) students_gender,
count(distinct case when u_students.urm = 1 then us.user_id else null end) students_urm,
count(distinct case when u_students.races like '%black%' then us.user_id else null end) students_black,
count(distinct case when u_students.races like '%hispanic%' then us.user_id else null end) students_hispanic,
count(distinct case when u_students.races like '%american_indian%' then us.user_id else null end) students_native,
count(distinct case when u_students.races like '%hawaiian%' then us.user_id else null end) students_hawaiian,
count(distinct case when u_students.urm in (0,1) then us.user_id else null end) students_race
from #tc_teacher tct  
left join #rp_teacher rpt on rpt.user_id = tct.user_id
left join regional_partners rp on rp.id = tct.regional_partner_id
left join users u on u.id = tct.user_id
left join sections se on se.user_id = u.id and se.created_at >= '2017-06-01'
left join followers fo on fo.section_id = se.id
left join user_scripts us on us.user_id = fo.student_user_id and us.script_id in (181,187,169,189,223,221,122,123,124,125,126,127) and us.started_at >= '2017-07-01'
left join users u_students on u_students.id = us.user_id and u_students.user_type = 'student'
left join public.bb_quarterly_workshop_attendance qwa on qwa.user_id = tct.user_id
left join public.bb_most_progress mp on mp.user_id = tct.user_id
group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22;

-- append to teachercon data
insert into public.bb_rp_data_2017
select *
from #rp_data;
