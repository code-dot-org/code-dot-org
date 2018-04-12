-- # of teachers completing CSF for first time
select 
  'Teacher with classroom completing CSF for first time' metric, 
  count(*) value
from
(
  select 
    user_id, 
    min(completed_at) as first_completed_at
  from analysis.csf_completed_teachers
  group by 1
)
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- get count by month of students completing their first script
-- (first_script_complete, students)
select 
  'Students completing CSF for first time' metric, 
  count(*) value
from
(
  select 
    user_id, 
    min(completed_at) first_completed_at
  from csf_completed
  group by 1
)
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- pct female
select 
  'Students completing CSF for the first time, % female' metric, 
  count(distinct case when u.gender = 'f' then u.id else null end)::float / count(distinct case when u.gender in ('m','f') then u.id else null end) value
from
(
  select 
    user_id, 
    min(completed_at) first_completed_at
  from csf_completed
  group by 1
) temp
join users u on u.id = temp.user_id
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- *******************************************************
-- *** SAME METRICS -- ONLY FOR PD'D STUDENTS/TEACHERS ***
-- *******************************************************

-- # of PD'd teachers completing CSF for first time
select 
  'PDd teacher with classroom completing CSF for first time' metric,
  count(*) value
from
(
  select 
    user_id, 
    min(completed_at) as first_completed_at
  from analysis.csf_completed_teachers
  where user_id in (select user_id from csf_teachers_trained)
  group by 1
)
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- get count by month of students with PD'd teachers completing their first script
select 
  'Students of PDd teachers completing first script' metric, 
  count(distinct students.user_id) value
from
(
  select 
    user_id, 
    min(completed_at) first_completed_at
  from csf_completed
  group by 1
) students
join followers f on f.student_user_id = students.user_id
join sections se on se.id = f.section_id
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
  AND se.user_id in (select user_id from csf_teachers_trained)
group by 1

union all

-- pct female
select 
  'Students of PDd teachers completing first CSF script, % female' metric, 
  count(distinct case when u.gender = 'f' then u.id else null end)::float / count(distinct case when u.gender in ('m','f') then u.id else null end) value
from
(
  select 
    user_id, 
    min(completed_at) first_completed_at
  from csf_completed
  group by 1
) students
join followers f on f.student_user_id = students.user_id
join sections se on se.id = f.section_id
join users u on u.id = students.user_id
where DATE_PART(month,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
  AND DATE_PART(year,first_completed_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
  AND se.user_id in (select user_id from csf_teachers_trained)
group by 1;
