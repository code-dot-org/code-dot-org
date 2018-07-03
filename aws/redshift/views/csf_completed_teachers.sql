drop view analysis.csf_completed_teachers;
create view analysis.csf_completed_teachers as
select 
  user_id,
  school_year, 
  script_id,
  script_name,
  completed_at
from
(
  select 
    se.user_id, 
    com.school_year,
    com.script_id,
    com.script_name,
    completed_at,
    row_number() over(partition by se.user_id, com.school_year order by completed_at asc) completed_at_order
  from analysis.csf_completed com
    join analysis.school_years sy on com.completed_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = com.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id
      and 
      (
        -- One of new scripts, of any version (2017 or 2018 currently)
        (se.script_id IN 
            (select versioned_script_id from analysis.script_names where script_name_long in 
              ('Course A','Course B','Course C','Course D','Course E','Course F','Express','Pre-Express')
            )
        )
        or
        -- One of old scripts
        (se.script_id in (1,17,18,19,23))
        or
        -- No script assigned
        (se.script_id is null)
      )
)
where completed_at_order = 5
with no schema binding; 

GRANT ALL PRIVILEGES ON analysis.csf_completed_teachers TO GROUP admin;
GRANT SELECT ON analysis.csf_completed_teachers TO GROUP reader, GROUP reader_pii;
