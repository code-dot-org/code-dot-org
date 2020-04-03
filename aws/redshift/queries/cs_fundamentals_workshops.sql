with deep_dive_teachers as
(
select count(distinct studio_person_id) as count_of_teachers
from csf_teachers_trained t
join users u 
  on t.user_id = u.id
where date_part(month, cast(trained_at as date)) = date_part(month, dateadd(month, -1, getdate()))
and  date_part(year, cast(trained_at as date)) = date_part(year, dateadd(month, -1, getdate())) 
and subject = 'Deep Dive'
and studio_person_id not in 
    (select studio_person_id 
    from csf_teachers_trained t2
    join users u2 
        on t2.user_id = u2.id
    where cast(trained_at as date) <= last_day(dateadd(month, -2, getdate())) 
    and subject = 'Deep Dive'
    and studio_person_id is not null)
    ),
    
intro_teachers as 
(
select count(distinct studio_person_id) as count_of_teachers
from csf_teachers_trained t
join users u 
  on t.user_id = u.id
where date_part(month, cast(trained_at as date)) = date_part(month, dateadd(month, -1, getdate()))
and  date_part(year, cast(trained_at as date)) = date_part(year, dateadd(month, -1, getdate())) 
and subject = 'Intro Workshop'
and studio_person_id not in 
    (select studio_person_id 
    from csf_teachers_trained t2
    join users u2 
        on t2.user_id = u2.id
    where cast(trained_at as date)  <= last_day(dateadd(month, -2, getdate())) 
    and subject = 'Intro Workshop'
    and studio_person_id is not null)
    )

-- Number of new teachers reached via one of our CSF PD workshops (latest month)
select count(distinct studio_person_id) as value, 
'Number of new teachers reached via one of our CSF PD workshops' as metric,
1 as sort
from analysis.csf_teachers_trained t
join dashboard_production.users u 
  on t.user_id = u.id
where date_part(month, cast(trained_at as date)) = date_part(month, dateadd(month, -1, getdate()))
and  date_part(year, cast(trained_at as date)) = date_part(year, dateadd(month, -1, getdate())) 
and studio_person_id not in 
    (select studio_person_id 
    from analysis.csf_teachers_trained t2
    join dashboard_production.users u2 
        on t2.user_id = u2.id
    where cast(trained_at as date) <= last_day(dateadd(month, -2, getdate())) 
    and studio_person_id is not null)
    
union all 

-- Number of TOTAL teachers attending a CSF workshop (latest month)
select sum(count_of_teachers) as value,
'Number of new teachers reached via one of our CSF PD workshops (latest month)' as metric, -- counts only teachers being trained for the first time in the course in which they attended training (ie, unique teacher-course combos)
2 as sort
from 
(
select * from deep_dive_teachers
union all 
select * from intro_teachers
);
