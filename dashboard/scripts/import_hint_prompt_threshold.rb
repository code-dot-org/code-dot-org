#!/usr/bin/env ruby
require_relative('../config/environment')
require 'csv'

# Data was generated in Tableau with the following initial SQL:
#
# SELECT
#   "user_levels"."attempts" AS "attempts",
#   COUNT(DISTINCT "user_levels"."id") AS "ctd_id_ok",
#   "user_levels"."level_id" AS "level_id",
#   "user_levels"."script_id" AS "script_id"
# FROM
#   "dashboard_production"."user_levels" "user_levels"
#   INNER JOIN "dashboard_production"."users" "users"
#   ON ("user_levels"."user_id" = "users"."id")
#   WHERE
#     (("users"."birthday" >= (DATE '2006-01-01')) AND
#     ("users"."birthday" <= (DATE '2011-01-01')) AND
#     ("user_levels"."created_at" >= (TIMESTAMP '2016-08-01 00:00:00.000')) AND
#     ("user_levels"."script_id" IN (18, 19, 23)))
# GROUP BY 1, 3, 4
#
# I then added a table calculation in Tableau: the running total of the count of
# distinct user ids, with a secondary calculation to get the percent of total
# for each row.
#
# Finally, I filtered the data to grab only the smallest attempt for which the
# user count represented at least 75% of the total.

thresholds_csv = ARGV[0]
unless thresholds_csv
  puts 'Usage: import_hint_prompt_thresholds thresholds.csv'
  exit
end

CSV.table(thresholds_csv).each do |row|
  script_level = ScriptLevel.where(script_id: row[:script_id], level_id: row[:level_id]).first
  script_level.hint_prompt_attempts_threshold = row[:attempts] + 1
  script_level.save!
end
