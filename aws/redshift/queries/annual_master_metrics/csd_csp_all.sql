select
  'Started CSD, % high needs' metric,
  count(distinct case when high_needs = 1 then st.user_id end)::float 
  /
  count(distinct st.user_id) value,
  count(distinct st.user_id) denominator
from csp_csd_started st
join followers f on f.student_user_id = st.user_id
join school_years sy on f.created_at between sy.started_at and sy.ended_at
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos si on si.id = u.school_info_id
join school_stats ss on ss.school_id = si.school_id
where se.user_id in (select user_id from csp_csd_started_teachers where course_name = 'csd' and school_year = '2019-20')
and st.course_name = 'csd' 
and st.school_year = '2019-20'
and st.started_at::date <= '2020-12-31'
and high_needs is not null
group by 1

union all

select
  'Started CSD, % rural' metric,
  count(distinct case when rural = 1 then st.user_id end)::float 
  /
  count(distinct st.user_id) value,
  count(distinct st.user_id) denominator
from csp_csd_started st
join followers f on f.student_user_id = st.user_id
join school_years sy on f.created_at between sy.started_at and sy.ended_at
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos si on si.id = u.school_info_id
join school_stats ss on ss.school_id = si.school_id
where se.user_id in (select user_id from csp_csd_started_teachers where course_name = 'csd' and school_year = '2019-20')
and st.course_name = 'csd' 
and st.school_year = '2019-20'
and st.started_at::date <= '2019-12-31'
and rural is not null
group by 1

union all

-- teachers per school, CSP
select 
'teachers per school, CSP' metric,
count(distinct st.user_id)::float / count(distinct school_id) value, 
count(distinct school_id) denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join school_infos si on si.id = u.school_info_id
where school_year = '2019-20'
and course_name = 'csp'
and school_id is not null
and started_at::date <= '2019-12-31'

union all

-- teachers per school, CSD
select
'teachers per school, CSD' metric,
 count(distinct st.user_id)::float / count(distinct school_id) value,
 count(distinct school_id) denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join school_infos si on si.id = u.school_info_id
where school_year = '2019-20'
and course_name = 'csd'
and school_id is not null
and started_at::date <= '2019-12-31'

union all

-- All time CSP PD'd teachers teaching
select 
'All time CSP PDd teachers teaching' metric,
count(distinct tt.studio_person_id) value,
null as denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and tt.course = 'CS Principles'
where st.school_year = '2019-20'
and course_name = 'csp'
and started_at::date <= '2019-12-31'

union all

-- All time CSD PD'd teachers teaching

select 'All time CSD PDd teachers teaching' metric,
count(distinct tt.studio_person_id) value,
null as denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and tt.course = 'CS Discoveries'
where st.school_year = '2019-20'
and course_name = 'csd'
and started_at::date <= '2019-12-31'

union all

-- teachers per school, CSP PD
select 
'teachers per school, CSP PD'  metric,
count(distinct tt.studio_person_id)::float / count(distinct tt.school_id) value,
count(distinct tt.school_id)  denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and tt.course = 'CS Principles'
where st.school_year = '2019-20'
and course_name = 'csp'
and tt.school_id is not null
and started_at::date <= '2019-12-31'

union all

-- teachers per school, CSD PD

select 
'teachers per school, CSD PD' metric,
count(distinct tt.studio_person_id)::float / count(distinct tt.school_id) value,
 count(distinct tt.school_id) denominator
from csp_csd_started_teachers st
join users u on u.id = st.user_id
join csp_csd_teachers_trained tt on tt.studio_person_id = u.studio_person_id and tt.course = 'CS Discoveries' and tt.school_year = '2019-20'
where st.school_year = '2019-20'
and course_name = 'csd'
and tt.school_id is not null
and started_at::date <= '2019-12-31'

union all

-- # of students starting (first half of year)
select course_name + ' # of students starting (first half of year)' as metric,
 count(distinct user_id) value,
null as denominator
from csp_csd_started
where started_at <= '2019-12-31'
and school_year = '2019-20'
group by course_name 

union all

-- % URM of students starting (first half of year)
select course_name + '% URM of students starting (first half of year)' metric, 
avg(urm::float) value,
null as denominator
from
(
select distinct course_name, user_id, urm
from csp_csd_started st
join users u on u.id = st.user_id
where started_at <= '2019-12-31'
and school_year = '2019-20'
)
group by course_name

union all 

-- % Female of students starting (first half of year)
select course_name + ' % Female of students starting (first half of year)' metric, 
 count(distinct case when gender = 'f' then user_id end)::float / 
 count(distinct case when gender in ('m','f') then user_id end) value,
null as denominator
from
(
select distinct course_name, user_id, gender
from csp_csd_started st
join users u on u.id = st.user_id
where started_at <= '2019-12-31'
and school_year = '2019-20'
)
group by course_name ;
