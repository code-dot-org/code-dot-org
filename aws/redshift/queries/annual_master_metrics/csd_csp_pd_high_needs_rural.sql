

select count(distinct case when ss.high_needs = 1 then f.student_user_id end)::float /
  count(distinct f.student_user_id) pct_high_needs,
    count(distinct f.student_user_id) denominator
from users u
join sections se on se.user_id = u.id
join followers f on f.section_id = se.id
join user_scripts us on us.user_id = f.student_user_id
join scripts sc on sc.id = us.script_id
join users u_student on u_student.id = f.student_user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and course = 'CS Principles'
join school_stats ss on ss.school_id = tt.school_id
where sc.family_name in ('csp1','csp2','csp3','csp4','csp5','csp-explore','csp-create','csppostap')
and us.started_at between '2019-07-01' and '2019-12-31'
and (u_student.deleted_at is null or u_student.deleted_at::date >= '2020-01-01')
and u_student.user_type = 'student'
and high_needs is not null
and se.user_id in
(
  -- teachers trained by Code.org in CS Principles
  select u.id user_id
  from analysis.csp_csd_teachers_trained tt
  join users u on u.studio_person_id = tt.studio_person_id 
  where course = 'CS Principles'
);


select count(distinct case when ss.high_needs = 1 then f.student_user_id end)::float /
  count(distinct f.student_user_id) pct_high_needs,
    count(distinct f.student_user_id) denominator
from users u
join sections se on se.user_id = u.id
join followers f on f.section_id = se.id
join user_scripts us on us.user_id = f.student_user_id
join scripts sc on sc.id = us.script_id
join users u_student on u_student.id = f.student_user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and course = 'CS Discoveries'
join school_stats ss on ss.school_id = tt.school_id
where sc.id in (select script_id from course_scripts cs join unit_groups c on c.id = cs.course_id where c.name in ('csd-2017','csd-2018', 'csd-2019'))
and us.started_at between '2019-07-01' and '2019-12-31'
and (u_student.deleted_at is null or u_student.deleted_at::date >= '2020-01-01')
and u_student.user_type = 'student'
and high_needs is not null
and se.user_id in
(
  -- teachers trained by Code.org in CS Discoveries
  select u.id user_id
  from analysis.csp_csd_teachers_trained tt
  join users u on u.studio_person_id = tt.studio_person_id 
  where course = 'CS Discoveries'
);

select ((.3937477903782872	* 73542) + (.5098155923985974 * 184808)) / (73542 + 184808);




select count(distinct case when ss.rural = 1 then f.student_user_id end)::float /
  count(distinct f.student_user_id) pct_rural,
    count(distinct f.student_user_id) denominator
from users u
join sections se on se.user_id = u.id
join followers f on f.section_id = se.id
join user_scripts us on us.user_id = f.student_user_id
join scripts sc on sc.id = us.script_id
join users u_student on u_student.id = f.student_user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and course = 'CS Principles'
join school_stats ss on ss.school_id = tt.school_id
where sc.family_name in ('csp1','csp2','csp3','csp4','csp5','csp-explore','csp-create','csppostap')
and us.started_at between '2019-07-01' and '2019-12-31'
and (u_student.deleted_at is null or u_student.deleted_at::date >= '2020-01-01')
and u_student.user_type = 'student'
and rural is not null
and se.user_id in
(
  -- teachers trained by Code.org in CS Principles
  select u.id user_id
  from analysis.csp_csd_teachers_trained tt
  join users u on u.studio_person_id = tt.studio_person_id 
  where course = 'CS Principles'
  --and school_year != '2018-19'
);


select count(distinct case when ss.rural = 1 then f.student_user_id end)::float /
  count(distinct f.student_user_id) pct_rural,
    count(distinct f.student_user_id) denominator
from users u
join sections se on se.user_id = u.id
join followers f on f.section_id = se.id
join user_scripts us on us.user_id = f.student_user_id
join scripts sc on sc.id = us.script_id
join users u_student on u_student.id = f.student_user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and course = 'CS Discoveries'
join school_stats ss on ss.school_id = tt.school_id
where sc.id in (select script_id from course_scripts cs join unit_groups c on c.id = cs.course_id where c.name in ('csd-2017','csd-2018', 'csd-2019'))
and us.started_at between '2019-07-01' and '2019-12-31'
and (u_student.deleted_at is null or u_student.deleted_at::date >= '2020-01-01')
and u_student.user_type = 'student'
and rural is not null
and se.user_id in
(
  -- teachers trained by Code.org in CS Discoveries
  select u.id user_id
  from analysis.csp_csd_teachers_trained tt
  join users u on u.studio_person_id = tt.studio_person_id 
  where course = 'CS Discoveries'
);

select ((0.19009572332870156 *	77724) +(0.31701545244637613 *	191426)) / (191426 + 77724);
