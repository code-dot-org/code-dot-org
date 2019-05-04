select *
from
(
SELECT 
  COUNT(0) value, 
  'all time teachers' metric, 
  1 as sort
FROM users 
WHERE user_type = 'teacher' 
and cast(created_at as date) <= last_day(dateadd(month, -1, getdate()))
AND current_sign_in_at IS NOT NULL

union all

SELECT 
  COUNT(0) value, 
  'all time students' metric, 
  2 as sort
FROM users 
WHERE user_type = 'student' 
and cast(created_at as date) <= last_day(dateadd(month, -1, getdate()))
AND current_sign_in_at IS NOT NULL

union all

SELECT 
  COUNT(distinct case when gender = 'f' then u.id end)::float / COUNT(distinct u.id) value, 
  'all time % female' metric, 
  3 as sort
FROM users u
WHERE user_type = 'student' 
and cast(u.created_at as date) <= last_day(dateadd(month, -1, getdate()))
AND current_sign_in_at IS NOT NULL
and gender in ('m', 'f')

union all

SELECT 
  COUNT(distinct case when f.id is not null then u.id end)::float / count(distinct u.id) value, 
  'all time % of students with teachers' metric,
  4 as sort
FROM users u
left join followers f on f.student_user_id = u.id
WHERE user_type = 'student' 
and cast(u.created_at as date) <= last_day(dateadd(month, -1, getdate()))
AND current_sign_in_at IS NOT NULL

union all

select 
  count(*) value,
  'all time projects' metric,
  5 as sort
from storage_apps 
where standalone = 1
and cast(created_at as date) <= last_day(dateadd(month, -1, getdate()))

union all

SELECT 
  COUNT(DISTINCT sections.user_id) value, 
  'L30D teachers with active students' metric,
  6 as sort
FROM (SELECT u.id FROM sign_ins si join users u on u.id = si.user_id WHERE user_type = 'student' AND date_diff('day', sign_in_at, last_day(dateadd(month, -1, getdate()))) between 0 and 30) AS u 
INNER JOIN followers ON u.id = followers.student_user_id
inner join sections on followers.section_id = sections.id

union all

SELECT 
  COUNT(DISTINCT sections.user_id) value, 
  'L365D teachers with active students' metric,
  7 as sort
FROM (SELECT id FROM users WHERE user_type = 'student' AND date_diff('day', current_sign_in_at, (select max(created_at) from users)) between 0 and 364) AS u -- calculated when closest to end of month data was available
INNER JOIN followers ON u.id = followers.student_user_id
inner join sections on followers.section_id = sections.id

union all

select 
  count(distinct user_id) value, 
  'L30D active students' metric,
  8 as sort
from sign_ins si
join users u on u.id = si.user_id
where user_type = 'student'
and date_diff('day', sign_in_at, last_day(dateadd(month, -1, getdate()))) between 0 and 29

union all

SELECT 
  COUNT(distinct case when gender = 'f' then u.id end)::float / COUNT(distinct u.id) value, 
  'L30D % female students' metric,
  9 as sort
FROM users u
WHERE user_type = 'student' 
AND u.id in (SELECT u.id FROM sign_ins si join users u on u.id = si.user_id WHERE user_type = 'student' AND date_diff('day', sign_in_at, last_day(dateadd(month, -1, getdate()))) between 0 and 29)
and gender in ('m', 'f')

union all

select 
  count(distinct 
    case when urm = 1 then u.id
    else null
    END
  )::float /
  count(distinct 
    case when urm in (0,1) then u.id
    else null
  END
  ) value, 
  'L30D % URM students (13+)' metric,
  10 as sort
FROM users u
WHERE user_type = 'student' 
AND u.id in (SELECT u.id FROM sign_ins si join users u on u.id = si.user_id WHERE user_type = 'student' AND date_diff('day', sign_in_at, last_day(dateadd(month, -1, getdate()))) between 0 and 29)

union all

SELECT 
  COUNT(distinct case when f.id is not null then u.id end)::float / count(distinct u.id) value, 
  'L30D % students with teachers' metric,
  11 as sort
FROM users u
left join followers f on f.student_user_id = u.id
WHERE user_type = 'student' 
AND u.id in (SELECT u.id FROM sign_ins si join users u on u.id = si.user_id WHERE user_type = 'student' AND date_diff('day', sign_in_at, last_day(dateadd(month, -1, getdate()))) between 0 and 29)

union all

select 
  count(distinct id) value, 
  'L365D active students' metric, 
  12 as sort
from users
where date_diff('day', current_sign_in_at, (select max(created_at) from users)) between 0 and 364 -- calculated when most recent data was from oct 13
and user_type = 'student'

)
order by sort asc;
