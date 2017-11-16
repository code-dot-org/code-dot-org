-- teachers who attended teachercon
drop table if exists #tc_teacher;
create temp table #tc_teacher as
select distinct
course,
case when pdw.id in (2582,2583,2584,2585,2586,2587,2588,2589,2590,2591,2592,2593,2594,2595,2596,2597) then 'Phoenix'
when pdw.id in (2686,2687,2688,2689,2690,2691,2692,2693,2694,2695,2696,2697,2698,2699,2700) then 'Philadelphia'
when pdw.id in (2450,2451) then 'Houston' end as location,
pde.user_id,
pde.first_name,
pde.last_name,
pde.email
from pd_enrollments pde
join pd_workshops pdw on pde.pd_workshop_id = pdw.id
join pd_attendances pda on pda.pd_enrollment_id = pde.id
where pde.email not like '%@code.org'
and pdw.id in (
2582,2583,2584,2585,2586,2587,2588,2589,2590,
2591,2592,2593,2594,2595,2596,2597,
2686,2687,2688,2689,2690,2691,2692,2693,
2694,2695,2696,2697,2698,2699,2700,
2451,
2450
)
and pde.deleted_at is null;

-- school/partner info for teachers who applied to teachercon
drop table if exists #rp_teacher;
create temp table #rp_teacher as
select distinct regional_partner_override, regional_partner_id, user_id, rp.name, 
rpsd.school_district_id,
json_extract_path_text(application, 'school') school_id,
sc.name school_name, sc.city, sc.state, sd.name school_district_name,
case
WHEN totfrl IS NULL OR total IS NULL THEN NULL
WHEN totfrl::FLOAT/ total > 0.5 THEN 1
ELSE 0
END high_needs
from pd_teacher_applications pdta
left join regional_partners_school_districts rpsd on rpsd.school_district_id = json_extract_path_text(application, 'school-district')
left join regional_partners rp on rp.id = rpsd.regional_partner_id
left join schools sc on sc.id = json_extract_path_text(application, 'school')
left join school_districts sd on sd.id = sc.school_district_id
left join public.bb_schools_additional sa on sa.ncessch = sc.id
where (json_extract_path_text(application, 'school-district') != '' or regional_partner_override is not null)
and (rpsd.school_district_id not in (1200390,1201320) or rpsd.school_district_id is null)
union all
-- manual hack to deal with school districts where CSP and CSD teachers are split between two partners
-- all teachers from '17 TC cohort are CSD teachers
select distinct regional_partner_override, regional_partner_id, user_id, rp.name, 
rpsd.school_district_id,
json_extract_path_text(application, 'school') school_id,
sc.name school_name, sc.city, sc.state, sd.name school_district_name,
case
WHEN totfrl IS NULL OR total IS NULL THEN NULL
WHEN totfrl::FLOAT/ total > 0.5 THEN 1
ELSE 0
END high_needs
from pd_teacher_applications pdta
left join regional_partners_school_districts rpsd on rpsd.school_district_id = json_extract_path_text(application, 'school-district') and course = 'csp'
left join regional_partners rp on rp.id = rpsd.regional_partner_id
left join schools sc on sc.id = json_extract_path_text(application, 'school')
left join school_districts sd on sd.id = sc.school_district_id
left join public.bb_schools_additional sa on sa.ncessch = sc.id
where (json_extract_path_text(application, 'school-district') != '' or regional_partner_override is not null)
and rpsd.school_district_id in (1200390,1201320);

--combine with non-static data (e.g., student progress, etc.)
drop table if exists #rp_data;
create temp table #rp_data as
select course, location, tct.user_id, first_name, last_name, tct.email, regional_partner_id, school_district_id, school_id,
school_name, city, state, school_district_name,
case 
when regional_partner_override is not null then regional_partner_override 
when regional_partner_id = 24 then 'America Campaign - Big Sky Code Academy'
else rpt.name end as regional_partner,
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
left join #rp_teacher rpt on tct.user_id = rpt.user_id
left join users u on u.id = tct.user_id
left join sections se on se.user_id = u.id and se.created_at >= '2017-06-01'
left join followers fo on fo.section_id = se.id
left join user_scripts us on us.user_id = fo.student_user_id and us.script_id in (181,187,169,189,223,221,122,123,124,125,126,127) and us.started_at >= '2017-07-01'
left join users u_students on u_students.id = us.user_id and u_students.user_type = 'student'
left join public.bb_quarterly_workshop_attendance qwa on qwa.user_id = tct.user_id
left join public.bb_most_progress mp on mp.user_id = tct.user_id
where tct.user_id not in (
-- list of known bad user ids from: https://docs.google.com/spreadsheets/d/1IsO7w17Zh8qHqj_uZ5E9D-Vn_C7el_0iI-l8E6Hh_zw/edit#gid=0
7431605,
15094992,
24198489,
7690120,
21841767,
6100901,
18029068,
2100217,
3743671,
14953224,
17866768,
5037830,
14953163,
14953876,
17866972,
25439527,
23554454
)
group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22;

drop table if exists public.bb_rp_data_2017;
create table public.bb_rp_data_2017 as
select course, location, rpd.user_id, first_name, last_name,
email, regional_partner_id, school_district_id, school_id,
school_name, city, state, school_district_name,
coalesce(rpd.regional_partner, rpm.partner) regional_partner,
current_sign_in_at, 
q1, q2, q3, q4,
high_needs, 
script_most_progress, students_script_most_progress,
sections, students, 
students_female, students_gender, students_urm,
students_black, students_hispanic, students_native, students_hawaiian,
students_race
from #rp_data rpd
left join public.tc_2017_rp_mappings_manual rpm on rpm.user_id = rpd.user_id
where rpd.user_id not in (select user_id from pd_facilitator_program_registrations)
;

GRANT SELECT
ON public.bb_rp_data_2017
TO GROUP reader_pii, GROUP admin;
