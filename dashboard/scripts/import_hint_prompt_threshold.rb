#!/usr/bin/env ruby
require_relative('../config/environment')
require 'csv'

# Data was generated in Redshift with the following SQL:
#
# select
#   l.name,
#   min(attempts) as percentile_75
# from
# (
#   select
#     ul.script_id,
#     ul.level_id,
#     ul.user_id,
#     ul.attempts,
#     ntile(4) over(partition by script_id, level_id order by attempts asc) as quartile
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
# join dashboard_production.levels l on l.id = level_id
# where quartile = 4
# group by 1;

# To generate attempts for the CSF 2020 levels we re-ran the query above
# with the following adjustments:
#
#  script names: 'coursea-2020', 'courseb-2020', 'coursec-2020', 'coursed-2020',
#     'coursee2020', 'coursef-2020',
#  birthday between: '2008-01-01' and '2013-01-01',
#  created_at::date >= '2020-01-01'

thresholds_csv = ARGV[0]
unless thresholds_csv
  puts 'Usage: import_hint_prompt_thresholds thresholds.csv'
  exit
end

CSV.table(thresholds_csv).each do |row|
  Level.find_by_key(row[:name]).update!(hint_prompt_attempts_threshold: row[:attempts] + 1)
end
