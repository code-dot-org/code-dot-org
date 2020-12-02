-- code studio last 365-DAY ACTIVE annual master metrics
select
  count(distinct case when high_needs = 1 then si.user_id end)::float 
  /
  count(distinct si.user_id) value,
  count(distinct si.user_id) denominator, 
  'L365D % students in high needs schools' metric, 
  date_part(year,(dateadd(year, -1, getdate()))) as year,
  1 as sort
from sign_ins si
join followers f on f.student_user_id = si.user_id
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos sinf on sinf.id = u.school_info_id
join school_stats ss on ss.school_id = sinf.school_id
where high_needs is not null
and sign_in_at between date_part(year,(dateadd(year, -1, getdate())))::varchar + '-01-01' and date_part(year,(dateadd(year, -1, getdate())))::varchar + '-12-31'

union all

select
  count(distinct case when rural = 1 then si.user_id end)::float 
  /
  count(distinct si.user_id) value, 
  count(distinct si.user_id) as denominator, 
  'L365D % students in rural schools' metric, 
  date_part(year,(dateadd(year, -1, getdate()))) as year,
  2 as sort
from sign_ins si
join followers f on f.student_user_id = si.user_id
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos sinf on sinf.id = u.school_info_id
join school_stats ss on ss.school_id = sinf.school_id
where rural is not null
and sign_in_at::date between date_part(year,(dateadd(year, -1, getdate())))::varchar + '-01-01' and date_part(year,(dateadd(year, -1, getdate())))::varchar + '-12-31'

union all

SELECT 
  COUNT(distinct case when f.id is not null then u.id end)::float / count(distinct u.id) value,
  count(distinct u.id) denominator, 
  'L365D % students with teachers' metric,
  date_part(year,(dateadd(year, -1, getdate()))) as year,
  3 as sort
FROM users u
left join followers f on f.student_user_id = u.id
WHERE user_type = 'student' 
AND u.id in (SELECT u.id FROM sign_ins si join users u on u.id = si.user_id WHERE user_type = 'student' AND sign_in_at::date 
between date_part(year,(dateadd(year, -1, getdate())))::varchar + '-01-01' and date_part(year,(dateadd(year, -1, getdate())))::varchar + '-12-31');
