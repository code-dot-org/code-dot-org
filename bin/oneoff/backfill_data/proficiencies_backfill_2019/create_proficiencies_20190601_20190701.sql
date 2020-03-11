CREATE TABLE user_proficiencies_20190601_20190701 AS
SELECT
  user_levels.user_id,
  SUM(IF(level_concept_difficulties.sequencing = 1, 1, 0)) AS sequencing_d1_count,
  SUM(IF(level_concept_difficulties.sequencing = 2, 1, 0)) AS sequencing_d2_count,
  SUM(IF(level_concept_difficulties.sequencing = 3, 1, 0)) AS sequencing_d3_count,
  SUM(IF(level_concept_difficulties.sequencing = 4, 1, 0)) AS sequencing_d4_count,
  SUM(IF(level_concept_difficulties.sequencing = 5, 1, 0)) AS sequencing_d5_count,
  SUM(IF(level_concept_difficulties.debugging = 1, 1, 0)) AS debugging_d1_count,
  SUM(IF(level_concept_difficulties.debugging = 2, 1, 0)) AS debugging_d2_count,
  SUM(IF(level_concept_difficulties.debugging = 3, 1, 0)) AS debugging_d3_count,
  SUM(IF(level_concept_difficulties.debugging = 4, 1, 0)) AS debugging_d4_count,
  SUM(IF(level_concept_difficulties.debugging = 5, 1, 0)) AS debugging_d5_count,
  SUM(IF(level_concept_difficulties.repeat_loops = 1, 1, 0)) AS repeat_loops_d1_count,
  SUM(IF(level_concept_difficulties.repeat_loops = 2, 1, 0)) AS repeat_loops_d2_count,
  SUM(IF(level_concept_difficulties.repeat_loops = 3, 1, 0)) AS repeat_loops_d3_count,
  SUM(IF(level_concept_difficulties.repeat_loops = 4, 1, 0)) AS repeat_loops_d4_count,
  SUM(IF(level_concept_difficulties.repeat_loops = 5, 1, 0)) AS repeat_loops_d5_count,
  SUM(IF(level_concept_difficulties.repeat_until_while = 1, 1, 0)) AS repeat_until_while_d1_count,
  SUM(IF(level_concept_difficulties.repeat_until_while = 2, 1, 0)) AS repeat_until_while_d2_count,
  SUM(IF(level_concept_difficulties.repeat_until_while = 3, 1, 0)) AS repeat_until_while_d3_count,
  SUM(IF(level_concept_difficulties.repeat_until_while = 4, 1, 0)) AS repeat_until_while_d4_count,
  SUM(IF(level_concept_difficulties.repeat_until_while = 5, 1, 0)) AS repeat_until_while_d5_count,
  SUM(IF(level_concept_difficulties.for_loops = 1, 1, 0)) AS for_loops_d1_count,
  SUM(IF(level_concept_difficulties.for_loops = 2, 1, 0)) AS for_loops_d2_count,
  SUM(IF(level_concept_difficulties.for_loops = 3, 1, 0)) AS for_loops_d3_count,
  SUM(IF(level_concept_difficulties.for_loops = 4, 1, 0)) AS for_loops_d4_count,
  SUM(IF(level_concept_difficulties.for_loops = 5, 1, 0)) AS for_loops_d5_count,
  SUM(IF(level_concept_difficulties.events = 1, 1, 0)) AS events_d1_count,
  SUM(IF(level_concept_difficulties.events = 2, 1, 0)) AS events_d2_count,
  SUM(IF(level_concept_difficulties.events = 3, 1, 0)) AS events_d3_count,
  SUM(IF(level_concept_difficulties.events = 4, 1, 0)) AS events_d4_count,
  SUM(IF(level_concept_difficulties.events = 5, 1, 0)) AS events_d5_count,
  SUM(IF(level_concept_difficulties.variables = 1, 1, 0)) AS variables_d1_count,
  SUM(IF(level_concept_difficulties.variables = 2, 1, 0)) AS variables_d2_count,
  SUM(IF(level_concept_difficulties.variables = 3, 1, 0)) AS variables_d3_count,
  SUM(IF(level_concept_difficulties.variables = 4, 1, 0)) AS variables_d4_count,
  SUM(IF(level_concept_difficulties.variables = 5, 1, 0)) AS variables_d5_count,
  SUM(IF(level_concept_difficulties.functions = 1, 1, 0)) AS functions_d1_count,
  SUM(IF(level_concept_difficulties.functions = 2, 1, 0)) AS functions_d2_count,
  SUM(IF(level_concept_difficulties.functions = 3, 1, 0)) AS functions_d3_count,
  SUM(IF(level_concept_difficulties.functions = 4, 1, 0)) AS functions_d4_count,
  SUM(IF(level_concept_difficulties.functions = 5, 1, 0)) AS functions_d5_count,
  SUM(IF(level_concept_difficulties.functions_with_params = 1, 1, 0)) AS functions_with_params_d1_count,
  SUM(IF(level_concept_difficulties.functions_with_params = 2, 1, 0)) AS functions_with_params_d2_count,
  SUM(IF(level_concept_difficulties.functions_with_params = 3, 1, 0)) AS functions_with_params_d3_count,
  SUM(IF(level_concept_difficulties.functions_with_params = 4, 1, 0)) AS functions_with_params_d4_count,
  SUM(IF(level_concept_difficulties.functions_with_params = 5, 1, 0)) AS functions_with_params_d5_count,
  SUM(IF(level_concept_difficulties.conditionals = 1, 1, 0)) AS conditionals_d1_count,
  SUM(IF(level_concept_difficulties.conditionals = 2, 1, 0)) AS conditionals_d2_count,
  SUM(IF(level_concept_difficulties.conditionals = 3, 1, 0)) AS conditionals_d3_count,
  SUM(IF(level_concept_difficulties.conditionals = 4, 1, 0)) AS conditionals_d4_count,
  SUM(IF(level_concept_difficulties.conditionals = 5, 1, 0)) AS conditionals_d5_count
FROM user_levels
LEFT OUTER JOIN authored_hint_view_requests
  ON authored_hint_view_requests.user_id = user_levels.user_id
    AND authored_hint_view_requests.script_id = user_levels.script_id
    AND authored_hint_view_requests.level_id = user_levels.level_id
LEFT OUTER JOIN hint_view_requests
  ON hint_view_requests.user_id = user_levels.user_id
    AND hint_view_requests.script_id = user_levels.script_id
    AND hint_view_requests.level_id = user_levels.level_id
INNER JOIN level_concept_difficulties
  ON level_concept_difficulties.level_id = user_levels.level_id
WHERE user_levels.best_result = 100
  AND user_levels.script_id IN (363, 366, 369, 370, 357, 360, 361)
  AND user_levels.id > 2169000000
  AND user_levels.id < 2190500000
  AND user_levels.created_at > "2019-06-01"
  AND user_levels.created_at < "2019-07-01"
  AND authored_hint_view_requests.id IS NULL
  AND hint_view_requests.id IS NULL
GROUP BY user_levels.user_id;
