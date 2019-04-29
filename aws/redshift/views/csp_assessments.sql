-- potential to dos:
---- zero out classrooms where everyone gets 100%?
---- divide by assessment denominator (instead of questions answered)?
create or replace view analysis.csp_assessments  as
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

non_programming_level_groups as
(
select 
distinct level_group_level_id 
from analysis.contained_level_structure 
where (level_group_level_name like '%Unit 1%'
  or level_group_level_name like '%Unit 2%'
  or level_group_level_name like '%Unit 4%')
and course_name is not null
),
 
programming_level_groups as
(
select 
distinct level_group_level_id 
from analysis.contained_level_structure 
where (level_group_level_name like '%Unit 3%'
  or level_group_level_name like '%Unit 5%')
and course_name is not null
),

assessments as
(
  select 
    ul.user_id, 
    cls.level_group_level_id, 
    case 
      when plg.level_group_level_id is not null then 1
      when nplg.level_group_level_id is not null then 0
      else null end as is_programming_level_group,
    sy.school_year,
    count(*) questions, 
    sum(correct) num_correct
  from analysis.contained_level_structure cls 
    join dashboard_production.user_levels ul 
        on ul.level_id = cls.level_id 
        and ul.script_id = cls.script_id
    join dashboard_production_pii.users u 
        on u.id = ul.user_id 
        and u.user_type = 'student'
    join deduped_level_sources mt 
        on mt.level_source_id = ul.level_source_id
    join deduped_contained_level_answers la 
        on mt.data = la.answer_number 
        and la.level_id = mt.level_id
    join analysis.school_years sy 
        on ul.created_at between sy.started_at and sy.ended_at
    left join programming_level_groups plg
        on plg.level_group_level_id = cls.level_group_level_id
    left join non_programming_level_groups  nplg
        on nplg.level_group_level_id = cls.level_group_level_id
     where is_programming_level_group is not null
  group by 1,2,3, 4
)
select 
  se.user_id teacher_user_id, 
  f.student_user_id, 
  a.school_year, -- based on when the user_level is created
  count(distinct case when is_programming_level_group = 1 then level_group_level_id end) programming_assessments,
  
  sum(case when is_programming_level_group = 1 then num_correct end)::float
  / sum(case when is_programming_level_group = 1 then questions end) programming_pct_correct,
  
  count(distinct case when is_programming_level_group = 0 then level_group_level_id end) other_assessments,
  
  sum(case when is_programming_level_group = 0  then num_correct end)::float
  / sum(case when is_programming_level_group = 0 then questions end) other_pct_correct,
  
  count(distinct level_group_level_id) all_assessments,
  
  sum(num_correct)::float / sum(questions) all_pct_correct
  
from dashboard_production.sections se 
  join dashboard_production.followers f 
    on f.section_id = se.id
  join analysis.school_years sy 
    on f.created_at between sy.started_at and sy.ended_at
  left join assessments a -- why left join here? isn't the 'left' nulled by the where clause below?
    on a.user_id = f.student_user_id
    and a.school_year = sy.school_year
where se.user_id in (select user_id from analysis.csp_csd_started_teachers where course_name = 'csp')
  and a.questions >= 8 -- what is rationale behind this?
group by 1,2,3
with no schema binding;


GRANT ALL PRIVILEGES ON analysis.csp_assessments TO GROUP admin;
GRANT SELECT ON analysis.csp_assessments TO GROUP reader, GROUP reader_pii;
