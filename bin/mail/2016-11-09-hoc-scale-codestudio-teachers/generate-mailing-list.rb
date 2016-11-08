#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# Send to active CSF teachers, as defined by teachers with:
# 1. followers who have a last progress at data that is non null for any CSF script
# 2. a section where script id on the section in a CSF script
# 3. a last progress at date that is not null for any CSF script

CSF_SCRIPT_IDS = [1, 17, 18, 19, 23].freeze
CSF_SCRIPT_ID_QUERY = "(#{CSF_SCRIPT_IDS.join(',')})".freeze

queries = []

# 1. Teachers with followers who have a last progress at data that is non null for any CSF script
queries << <<SQL
  SELECT DISTINCT users.id, users.email, users.name
  FROM (
    SELECT user_id
    FROM user_scripts
    WHERE script_id IN #{CSF_SCRIPT_ID_QUERY}
      AND user_scripts.last_progress_at IS NOT NULL
  ) filtered_user_scripts
  INNER JOIN followers ON followers.student_user_id = filtered_user_scripts.user_id
  INNER JOIN sections ON sections.id = followers.section_id
  INNER JOIN users ON users.id = sections.user_id
SQL

# 2. Teachers with a section where script id on the section in a CSF script
queries << <<SQL
  SELECT DISTINCT users.id, users.email, users.name
  FROM sections
  INNER JOIN users ON users.id = sections.user_id
  WHERE sections.script_id IN #{CSF_SCRIPT_ID_QUERY}
SQL

# 3. Teachers with a last progress at date that is not null for any CSF script
queries << <<SQL
  SELECT DISTINCT teachers.id, teachers.email, teachers.name
  FROM (
    SELECT id, email, name
    FROM users
    WHERE user_type = 'teacher'
  ) teachers
  INNER JOIN user_scripts ON user_scripts.user_id = teachers.id
  WHERE user_scripts.script_id IN #{CSF_SCRIPT_ID_QUERY}
    AND user_scripts.last_progress_at IS NOT NULL
SQL

results = {}
queries.each do |query|
  DASHBOARD_DB.fetch(query).each do |teacher|
    email = teacher[:email]
    results[email] = {email: email, name: teacher[:name], id: teacher[:id]} unless results.key?(email) || UNSUBSCRIBERS[email]
  end
end

puts "#{results.count} active CSF teachers"
export_contacts_to_csv results, 'csf_teachers.csv'
