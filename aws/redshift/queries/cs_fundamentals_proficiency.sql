SELECT COUNT(0) value, 'Level 1 proficient students' metric
FROM users
INNER JOIN user_proficiencies
ON user_proficiencies.user_id = users.id
WHERE
case when sequencing_d1_count + sequencing_d2_count + sequencing_d3_count + sequencing_d4_count + sequencing_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when repeat_loops_d1_count + repeat_loops_d2_count + repeat_loops_d3_count + repeat_loops_d4_count + repeat_loops_d5_count >= 3 then 1 else 0 end
+ case when repeat_until_while_d1_count + repeat_until_while_d2_count + repeat_until_while_d3_count + repeat_until_while_d4_count + repeat_until_while_d5_count >= 3 then 1 else 0 end
+ case when for_loops_d1_count + for_loops_d2_count + for_loops_d3_count + for_loops_d4_count + for_loops_d5_count >= 3 then 1 else 0 end
)
+ case when events_d1_count + events_d2_count + events_d3_count + events_d4_count + events_d5_count >= 3 then 1 else 0 end
+ case when variables_d1_count + variables_d2_count + variables_d3_count + variables_d4_count + variables_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when functions_d1_count + functions_d2_count + functions_d3_count + functions_d4_count + functions_d5_count >= 3 then 1 else 0 end
+ case when functions_with_params_d1_count + functions_with_params_d2_count + functions_with_params_d3_count + functions_with_params_d4_count + functions_with_params_d5_count >= 3 then 1 else 0 end
)
+ case when conditionals_d1_count + conditionals_d2_count + conditionals_d3_count + conditionals_d4_count + conditionals_d5_count >= 3 then 1 else 0 end >= 3
AND users.user_type = 'student'

union all

SELECT COUNT(0) value, 'Level 2 proficient students' metric
FROM users
INNER JOIN user_proficiencies
ON user_proficiencies.user_id = users.id
WHERE
case when sequencing_d2_count + sequencing_d3_count + sequencing_d4_count + sequencing_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when repeat_loops_d2_count + repeat_loops_d3_count + repeat_loops_d4_count + repeat_loops_d5_count >= 3 then 1 else 0 end
+ case when repeat_until_while_d2_count + repeat_until_while_d3_count + repeat_until_while_d4_count + repeat_until_while_d5_count >= 3 then 1 else 0 end
+ case when for_loops_d2_count + for_loops_d3_count + for_loops_d4_count + for_loops_d5_count >= 3 then 1 else 0 end
)
+ case when events_d2_count + events_d3_count + events_d4_count + events_d5_count >= 3 then 1 else 0 end
+ case when variables_d2_count + variables_d3_count + variables_d4_count + variables_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when functions_d2_count + functions_d3_count + functions_d4_count + functions_d5_count >= 3 then 1 else 0 end
+ case when functions_with_params_d2_count + functions_with_params_d3_count + functions_with_params_d4_count + functions_with_params_d5_count >= 3 then 1 else 0 end
)
+ case when conditionals_d2_count + conditionals_d3_count + conditionals_d4_count + conditionals_d5_count >= 3 then 1 else 0 end >= 3
AND users.user_type = 'student'

union all

SELECT COUNT(0) value, 'Level 3 proficient students' metric
FROM users 
INNER JOIN user_proficiencies ON user_proficiencies.user_id = users.id 
WHERE user_type = 'student' 
AND cast(basic_proficiency_at as date) <= last_day(dateadd(month, -1, getdate())) -- assumes you are running this query in the month following the month you are reporting on

union all

SELECT COUNT(distinct u.id) * (COUNT(distinct case when gender = 'f' then u.id end)::float / COUNT(distinct case when gender in ('m', 'f') then u.id else null end)) value, '(extrapolated) # of level 3 proficient female students' metric
FROM users u
INNER JOIN user_proficiencies ON user_proficiencies.user_id = u.id 
WHERE user_type = 'student' 
AND cast(basic_proficiency_at as date) <= last_day(dateadd(month, -1, getdate()))

union all

SELECT COUNT(0) value, 'Level 4 proficient students' metric
FROM users
INNER JOIN user_proficiencies
ON user_proficiencies.user_id = users.id
WHERE 
case when sequencing_d4_count + sequencing_d5_count >= 3 then 1 else 0 end
+ LEAST(
1, 
case when repeat_loops_d4_count + repeat_loops_d5_count >= 3 then 1 else 0 end
+ case when repeat_until_while_d4_count + repeat_until_while_d5_count >= 3 then 1 else 0 end
+ case when for_loops_d4_count + for_loops_d5_count >= 3 then 1 else 0 end
)
+ case when events_d4_count + events_d5_count >= 3 then 1 else 0 end
+ case when variables_d4_count + variables_d5_count >= 3 then 1 else 0 end
+ LEAST(
1, 
case when functions_d4_count + functions_d5_count >= 3 then 1 else 0 end
+ case when functions_with_params_d4_count + functions_with_params_d5_count >= 3 then 1 else 0 end
)
+ case when conditionals_d4_count + conditionals_d5_count >= 3 then 1 else 0 end >= 3
AND users.user_type = 'student'

union all

SELECT COUNT(0) value, 'Level 5 proficient students' metric
FROM users
INNER JOIN user_proficiencies
ON user_proficiencies.user_id = users.id
WHERE
case when sequencing_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when repeat_loops_d5_count >= 3 then 1 else 0 end
+ case when repeat_until_while_d5_count >= 3 then 1 else 0 end
+ case when for_loops_d5_count >= 3 then 1 else 0 end
)
+ case when events_d5_count >= 3 then 1 else 0 end
+ case when variables_d5_count >= 3 then 1 else 0 end
+ LEAST(
1,
case when functions_d5_count >= 3 then 1 else 0 end
+ case when functions_with_params_d5_count >= 3 then 1 else 0 end
)
+ case when conditionals_d5_count >= 3 then 1 else 0 end >= 3
AND users.user_type = 'student';
