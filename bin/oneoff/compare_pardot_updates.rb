#!/usr/bin/env ruby

# Comparing data in 2 versions of contact_rollups table to see what have changed and whether they
# look reasonable.
#
# Specifically, we want to compare an older version of contact_rollups table in a reporting database
# to its latest version in production database.
# The changes will be written to contact_rollups_future table in the reporting database
# for further analysis.
#
# This script can be modified to compare other tables.
#
# Analysis examples:
# How many rows changed values in "country" column?
#   select count(*) from contact_rollups_future where country is not null;
#
# What are those new values? (Note, 'null' string means the new value is NULL.)
#   select country, count(*) as cnt from contact_rollups_future group by country order by cnt desc;
#
# What were the previous values?
#   select a.country, b.country as new_country, count(*) as cnt
#   from contact_rollups as a inner join contact_rollups_future as b on a.id = b.id
#   where b.country is not null
#   group by country, new_country
#   order by cnt desc;

require File.expand_path('../../../pegasus/src/env', __FILE__)
require_relative '../../deployment'
require src_dir 'database'
require 'cdo/pegasus'

# Production database has a global max query execution timeout setting.
# This 30 minute setting can be used to override the timeout for a specific session or query.
MAX_EXECUTION_TIME_SEC = 1800

# Connection to read from Pegasus production database.
PEGASUS_DB_READER = sequel_connect(
  CDO.pegasus_db_reader,
  CDO.pegasus_db_reader,
  query_timeout: MAX_EXECUTION_TIME_SEC
)

# Connection to read from Pegasus reporting database.
PEGASUS_REPORTING_DB_READER = sequel_connect(
  CDO.pegasus_reporting_db_reader,
  CDO.pegasus_reporting_db_reader,
  query_timeout: MAX_EXECUTION_TIME_SEC
)

# Connection to write to Pegasus reporting database.
PEGASUS_REPORTING_DB_WRITER = sequel_connect(
  CDO.pegasus_reporting_db_writer,
  CDO.pegasus_reporting_db_writer,
  query_timeout: MAX_EXECUTION_TIME_SEC
)

# Table to write what data have changed to
OUTPUT_TABLE = :contact_rollups_future

# Ignore datetime columns such as updated_at, pardot_sync_at
COLUMNS_TO_COMPARE = [
  :id, :email, :opted_out, :dashboard_user_id, :name, :street_address, :city, :state, :country,
  :postal_code, :district_name, :district_city, :district_state, :district_zip, :school_name,
  :roles, :courses_facilitated, :professional_learning_enrolled, :professional_learning_attended,
  :hoc_organizer_years, :grades_taught, :ages_taught, :email_malformed, :forms_submitted,
  :form_roles, :opt_in
]

# Personal identifiable information can be used to compare but
# will not be written out to output table.
PII_COLUMNS = [:email, :name]

# Always create new output table. Drop table if it already exists.
def create_output_table
  # The output table has the same schema as contact_rollups.
  # Two ways to see contact_rollups schema
  # 1. In mysql: describe contact_rollups;
  # 2. In rails: PEGASUS_REPORTING_DB_WRITER.schema(:contact_rollups)
  PEGASUS_REPORTING_DB_WRITER.create_table! OUTPUT_TABLE do
    Integer :id
    column :opted_out, 'tinyint(1)'
    Integer :dashboard_user_id
    String :street_address, size: 1024
    String :city
    String :state
    String :country
    String :postal_code
    String :district_name
    String :district_city
    String :district_state
    String :district_zip
    String :school_name
    String :roles
    String :courses_facilitated, size: 1024
    String :professional_learning_enrolled, size: 1024
    String :professional_learning_attended, size: 1024
    String :hoc_organizer_years
    String :grades_taught
    String :ages_taught
    column :email_malformed, 'tinyint(1)'
    String :forms_submitted, size: 4096
    String :form_roles, size: 4096
    column :opt_in, 'tinyint(1)'

    unique :id
  end

  puts "Created #{OUTPUT_TABLE} table"
end

# Compare 2 versions of contact_rollups table and write the changes to output table.
#
# Source table is the one in reporting db. Destination table is the one in production db.
# The most important constraint here is (id, email) combination in contact_rollups must never changes.
# And newer emails inserted to the table will have higher ids.
#
# Output table contains only the columns that change and the original row id.
# Other columns are NULL.
#
# @param columns [Array<symbol>] columns used for content comparison
# @param pii_columns [Array<symbol>] PII columns that need special treatment
# @param max_row_read [Integer] max number of rows to read from each input table (used for limited testing).
#   Don't set to read all rows.
# @param max_row_write [Integer] max number of rows to write to output table (used for limited testing).
#   Don't set to write all changes to the output table.
#
def compare_tables(columns, pii_columns = [], max_row_read = nil, max_row_write = nil, debug = true)
  # Connect and stream data from both tables.
  read_query = <<-SQL.squish
    select #{columns.join(',')}
    from contact_rollups
    order by id
    #{max_row_read ? "limit #{max_row_read}" : ''}
  SQL

  src_iterator = PEGASUS_REPORTING_DB_READER[read_query].stream.to_enum
  dest_iterator = PEGASUS_DB_READER[read_query].stream.to_enum

  # Comparison result counters
  same_count = 0
  diff_count = 0
  not_there_count = 0
  column_diff_counts = {}

  # Iterate through 2 tables, row by row.
  src_row = grab_next(src_iterator)
  dest_row = grab_next(dest_iterator)

  while src_row
    # There could be some rows in source table but not in destination table.
    # That is because users can delete their accounts and we will remove all their records.
    # Only compare rows with the same id and email!
    while src_row[:id] < dest_row[:id]
      src_row = grab_next(src_iterator)
      not_there_count += 1
    end
    break unless src_row

    # Standardize string values
    src_values = src_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}
    dest_values = dest_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}

    changed_values = {}
    columns.each do |col|
      next if src_values[col] == dest_values[col]

      # Since we only write the values that change to output table, most of the columns will be NULL.
      # To distinguish between NULL as no change and NULL as the new value in destination table,
      # the latter will be written as string 'null'
      changed_values[col] = dest_row[col] || 'null'
      column_diff_counts[col] ||= 0
      column_diff_counts[col] += 1
    end

    if changed_values.present?
      diff_count += 1
      insert_values = changed_values.except(*pii_columns).merge({id: src_row[:id]})

      if insert_values.present?
        PEGASUS_REPORTING_DB_WRITER[OUTPUT_TABLE].insert(insert_values)
      end

      if debug && diff_count % 1000 == 0
        puts "Diff #{diff_count}:"
        puts "+ src_values = #{src_values}"
        puts "+ dest_values = #{dest_values}"
        puts "+ changed_values = #{changed_values}"
        puts "+ insert_values = #{insert_values}"
      end

      break if max_row_write && (diff_count == max_row_write)
    else
      same_count += 1
    end

    src_row = grab_next(src_iterator)
    dest_row = grab_next(dest_iterator)
  end

  print %(
    Done! Finished comparing #{same_count + diff_count + not_there_count} rows in contact_rollups table in reporting db and production db.
    Same rows = #{same_count}.
    Diff rows = #{diff_count}.
    Rows in reporting but not in production = #{not_there_count}.
    (Did not count rows in production but not in reporting db.)
  )

  puts "\nColumn diff distribution:"
  columns.each do |col|
    puts "+ #{col}: #{column_diff_counts[col]}"
  end
end

def grab_next(s)
  s.next
rescue StopIteration
  nil
end

def main
  create_output_table
  compare_tables(COLUMNS_TO_COMPARE, PII_COLUMNS)
end

def test
  create_output_table
  compare_tables([:id], [], 10)
  compare_tables([:id, :email], [], 10)
end

# To test in rails console:
# load "../bin/oneoff/compare_pardot_updates.rb"; test

# test
main
