--
-- this is an analytics query, to be run against the redshift database.
--
with
    course_structure_segment as (
        select distinct
            cs3.course_name_true
                      , cs3.script_id
                      , cs3.script_name
                      , cs3.unit
                      , cs3.version_year
                      , cs3.stage_id
                      , cs3.stage_name
                      , cs3.stage_number
                      , cs3.level_id
                      , cs3.level_name
                      , cs3.level_type
                      , cs3.level_number
                      , cs3.is_group_level
                      , coalesce( cl.contained_level_id , cs3.level_id) activity_level_id  -- contained level if it is a contained level, otherwise, base level
                      , cl.contained_level_position
                      , cl.contained_level_page
        from analysis.course_structure cs3
                 left JOIN dashboard_production.contained_levels cl on cs3.level_id = cl.level_group_level_id
        where
            cs3.course_name_true = 'csd'
          and cs3.unit in ('csd3')
          and cs3.version_year = '2023'
    )
   , activity_level_details as (
        select
            css1.*
             , l.name activity_level_name
             , l.type activity_level_type
             , case
                   when
                       l.type = 'Multi' and
                       JSON_EXTRACT_PATH_TEXT(JSON_EXTRACT_ARRAY_ELEMENT_TEXT(JSON_EXTRACT_PATH_TEXT(l.properties, 'questions'), 0, true),'text') <> ''
                       then JSON_EXTRACT_PATH_TEXT(JSON_EXTRACT_ARRAY_ELEMENT_TEXT(JSON_EXTRACT_PATH_TEXT(l.properties, 'questions'), 0, true),'text')
                   when
                       l.type in ('External', 'Multi')
                           and JSON_EXTRACT_PATH_TEXT(l.properties, 'markdown') <> ''
                       then JSON_EXTRACT_PATH_TEXT(l.properties, 'markdown')
                   else    JSON_EXTRACT_PATH_TEXT(l.properties, 'long_instructions')
            end instructions
        from course_structure_segment css1
                 left JOIN dashboard_production.levels l ON css1.activity_level_id  = l.id
    )
   , answer_texts as
    (select distinct level_id, answer_number, answer_text from dashboard_production.contained_level_answers)
   , level_sources_segment as (
        select
            ls2.id
             , ls2.level_id
             , ls2.md5
             , coalesce(cla.answer_text , ls2.data) data  -- no match when multiple answers are selected
             , ls2.created_at
             , ls2.updated_at
        from
            activity_level_details ald
                left join dashboard_production_pii.level_sources ls2 on ald.activity_level_id  = ls2.level_id
                left join answer_texts cla on ls2.level_id = cla.level_id and ls2."data" = cla.answer_number
                join analysis.school_years sy on ls2.created_at between sy.started_at and sy.ended_at
        where sy.school_year in ('2023-24')
    )
   , level_sources_free_response_segment as (
        select
            lsfr2.id
             , lsfr2.level_id
             , lsfr2.md5
             , lsfr2.data
             , lsfr2.created_at
             , lsfr2.updated_at
        from
            activity_level_details ald
                left join dashboard_production.level_sources_free_responses lsfr2 on ald.activity_level_id = lsfr2.level_id
                join analysis.school_years sy on lsfr2.created_at between sy.started_at and sy.ended_at
        where sy.school_year in ('2023-24')
    )
--
--
   , channel_tokens_users as (
        select
            usi.user_id
             , cs2.activity_level_id
             , ct2.*
        from course_structure_segment  cs2
                 join dashboard_production.channel_tokens ct2 on cs2.script_id = ct2.script_id and cs2.activity_level_id = ct2.level_id  -- joins on the actovity level: contained level if exists, otherwise, base level
                 join dashboard_production.user_project_storage_ids usi on ct2.storage_id = usi.id
    )
select distinct
    ul.user_id
    , cs.unit
    , cs.script_id
    , cs.stage_number
    , cs.stage_name
    , cs.level_number
    , cs.level_name
    , cs.level_type
    , cs.level_id
    , cs.is_group_level
    , cs.activity_level_id  -- contained level if it is a contained level, otherwise, base level
    , cs.activity_level_name  -- contained level if it is a contained level, otherwise, base level
    , cs.activity_level_type  -- contained level if it is a contained level, otherwise, base level
    , cs.contained_level_position
    , cs.instructions
    , ul.created_at
    , ul.attempts
    , ul.best_result
    ,
/* source for best result decode: https://github.com/code-dot-org/code-dot-org/blob/c29ada51ffa4e4e2abd47414919a1f779eea193f/apps/src/constants.js#L33 */
    case
        when ul.best_result is null then null
        when ul.best_result = -2	then 'nested_for_same_variable'
        when ul.best_result = -3	then 'empty_function_name'
        when ul.best_result = -4	then 'missing_recommended_block_unfinished'
        when ul.best_result = -5	then 'extra_function_fail'
        when ul.best_result = -6	then 'local_function_fail'
        when ul.best_result = -7	then 'generic_lint_fail'
        when ul.best_result = -8	then 'log_condition_fail'
        when ul.best_result = -9	then 'block_limit_fail'
        when ul.best_result = -10	then 'free_play_unchanged_fail'
        when ul.best_result = -50	then 'unsubmitted_attemp'
        when ul.best_result = -100	then 'skipped'
        when ul.best_result = -110	then 'teacher_feedback_keep_working'
        when ul.best_result = -150	then 'level_started'
        when ul.best_result = 0		then 'generic_fail'
        when ul.best_result = 1		then 'empty_block_fail'
        when ul.best_result = 2		then 'too_few_blocks_fail'
        when ul.best_result = 3		then 'level_incomplete_fail'
        when ul.best_result = 4		then 'missing_block_unfinished'
        when ul.best_result = 5		then 'extra_top_blocks_fail'
        when ul.best_result = 6		then 'runtime_error_fail'
        when ul.best_result = 7		then 'syntax_error_fail'
        when ul.best_result = 10	then 'missing_block_finished'
        when ul.best_result = 11	then 'app_specific_fail'
        when ul.best_result = 12	then 'empty_function_block_fail'
        when ul.best_result = 13	then 'unused_param'
        when ul.best_result = 14	then 'unused_function'
        when ul.best_result = 15	then 'param_input_unattached'
        when ul.best_result = 16	then 'incomplete_block_in_function'
        when ul.best_result = 17	then 'question_marks_in_number_field'
        when ul.best_result = 18	then 'empty_functional_block'
        when ul.best_result = 19	then 'example_failed'
        --  numbers below 20 are generally considered some form of failure.
        --  numbers >= 20 generally indicate some form of success (although again there
        --  are values like review_rejected_result that don't seem to quite meet that restriction.
        --
        -- the level was solved in a non-optimal way.  user may advance or retry.
        when ul.best_result = 20	then 'too_many_blocks_fail'
        when ul.best_result = 21	then 'app_specific_acceptable_fail'
        when ul.best_result = 22	then 'missing_recommended_block_finished'
        -- numbers >= 30, are considered to be "perfectly" solved, i.e. those in the range
        -- of 20-30 have correct but not optimal solutions	*/
        when ul.best_result = 30	then 'free_play'
        when ul.best_result = 31	then 'pass_with_extra_top_blocks'
        when ul.best_result = 32	then 'app_specific_imperfect_pass'
        when ul.best_result = 70	then 'edit_blocks'
        when ul.best_result = 90	then 'perfect_manual_pass'
        when ul.best_result = 100	then 'all_pass'
        when ul.best_result = 101	then 'contained_level_result'
        when ul.best_result = 102	then 'better_than_ideal'
--
        when ul.best_result = 1000	then 'unreviewed_submission_result'
        when ul.best_result = 1500	then 'review_rejected_result'
        when ul.best_result = 2000	then 'review_accepted_result'
--
        when ul.best_result > 29	then 'perfect'
        when ul.best_result >= 20	then 'pass'
        when ul.best_result >= 10	then 'finished_not_pass'
        else 'not_finished'
        end best_result_description
--     , case
--         when ul.best_result = 1000	then 'unreviewed'
--         when ul.best_result = 1500	then 'not_pass'
--         when ul.best_result > 29	then 'perfect'
--         when ul.best_result >= 20	then 'pass'
--         when ul.best_result >= 10	then 'not_pass'
--         else 'not_finished'
--         end best_result_pass_fail
    , ul.time_spent
    , case
        when cs.activity_level_type  = 'FreeResponse' then coalesce(lsfr.data,ls."data")
        else ls."data"
        end student_answer
    , p.project_type
    , case
        when p.project_type = 'free_response' then null
        else 'https://studio.code.org/projects/'||p.project_type||'/'||JSON_EXTRACT_PATH_TEXT(p.value,'id',true)
        end link_to_project
--, p.value
from activity_level_details  cs
         join dashboard_production.user_levels ul on ul.script_id = cs.script_id and ul.level_id = cs.activity_level_id
--          join analysis.school_years sy on ul.created_at between sy.started_at and sy.ended_at
         left join level_sources_segment ls  on ul.level_source_id = ls.id
         left join level_sources_free_response_segment lsfr  on ul.level_source_id = lsfr.id
         left join channel_tokens_users ctu on ul.user_id = ctu.user_id and ul.script_id = ctu.script_id and ul.level_id = ctu.activity_level_id
         left join dashboard_production_pii.projects p on ctu.storage_id = p.storage_id and ctu.storage_app_id = p.id
         left join dashboard_production_pii.users u on ul.user_id = u.id
where
    ul.attempts > 0
    and cs.level_name = 'CSD U3 Conditionals Apple 2_2023'
--  and ul.submitted = 1
--  and sy.school_year in ('2023-24')
-- order by 1,2,3,4
;
