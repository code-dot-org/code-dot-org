#!/usr/bin/env ruby
require_relative('../config/environment')
require 'csv'

# Data was generated in Redshift with the following SQL:
#
# select
#   script_id,
#   level_id,
#   min(attempts) as percentile_75
# from
# (
#   select
#     ul.script_id,
#     ul.level_id,
#     ul.user_id,
#     ul.attempts,
#   ntile(4) over(partition by script_id, level_id order by attempts asc) as quartile
#   from dashboard_production.user_levels ul
#   join dashboard_production_pii.users u on u.id = ul.user_id
#   join dashboard_production.scripts sc on sc.id = ul.script_id
#   where sc.name in (
#     'course1', 'course2', 'course3', 'course4',
#     'coursea', 'courseb', 'coursec', 'coursed', 'coursee', 'coursef'
#   )
#   and u.birthday between '2006-01-01' and '2011-01-01'
#   and ul.created_at::date >= '2016-08-01'
#   group by 1, 2, 3, 4
# )
# where quartile = 4
# group by 1, 2;

thresholds_csv = ARGV[0]
unless thresholds_csv
  puts 'Usage: import_hint_prompt_thresholds thresholds.csv'
  exit
end

CSV.table(thresholds_csv).each do |row|
  script_level = ScriptLevel.joins(:levels).where(script_id: row[:script_id], 'levels.id': row[:level_id]).first
  script_level.hint_prompt_attempts_threshold = row[:attempts] + 1
  script_level.save!
end
