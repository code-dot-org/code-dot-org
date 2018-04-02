-- potential to dos:
---- zero out classrooms where everyone gets 100%?
---- divide by assessment denominator (instead of questions answered)?
create or replace view analysis.csp_assessments as
with 
deduped_level_sources as
(
  select distinct 
    level_source_id, 
    level_id, 
    data, 
    md5, 
    hidden
  from dashboard_production.level_sources_multi_types
),
deduped_contained_level_answers as
(
  select distinct 
    level_id, 
    answer_number, 
    answer_text, 
    correct
  from dashboard_production.contained_level_answers
),
assessments as
(
  select 
    ul.user_id, 
    cs.level_id, 
    sy.school_year,
    count(*) questions, 
    sum(correct) num_correct
  from analysis.course_structure cs 
    join dashboard_production.contained_levels cl on cs.level_id = cl.level_group_level_id
    join dashboard_production.user_levels ul on ul.level_id = cl.contained_level_id and ul.script_id = cs.script_id
    join dashboard_production_pii.users u on u.id = ul.user_id and u.user_type = 'student'
    join deduped_level_sources mt on mt.level_source_id = ul.level_source_id
    join deduped_contained_level_answers la on mt.data = la.answer_number and la.level_id = mt.level_id
    join analysis.school_years sy on ul.created_at between sy.started_at and sy.ended_at
  where course_id = 15
    and cl.level_group_level_id in (6847,6412,6122,5985,5986,7459,7437,7519,7673,7778)
  group by 1,2,3
)
select 
  se.user_id teacher_user_id, 
  f.student_user_id, a.school_year,
  count(distinct case when level_id in (6847,7437,7519,7673,7778) then level_id end) programming_assessments,
  sum(case when level_id in (6847,7437,7519,7673,7778) then num_correct end)::float
  / sum(case when level_id in (6847,7437,7519,7673,7778) then questions end) programming_pct_correct,
  count(distinct case when level_id in (5985,5986,6122,6412,7459) then level_id end) other_assessments,
  sum(case when level_id in (5985,5986,6122,6412,7459) then num_correct end)::float
  / sum(case when level_id in (5985,5986,6122,6412,7459) then questions end) other_pct_correct,
  count(distinct level_id) all_assessments,
  sum(num_correct)::float / sum(questions) all_pct_correct
from dashboard_production.sections se 
  join dashboard_production.followers f on f.section_id = se.id
  left join assessments a on a.user_id = f.student_user_id
where se.user_id in (select user_id from analysis.csp_csd_started_teachers where course_name = 'csp')
  and a.questions >= 8
group by 1,2,3
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_assessments TO GROUP admin;
GRANT SELECT ON analysis.csp_assessments TO GROUP reader, GROUP reader_pii;
