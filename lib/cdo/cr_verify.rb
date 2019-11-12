require File.expand_path('../../../pegasus/src/env', __FILE__)
require_relative '../../deployment'
require src_dir 'database'
require 'cdo/pegasus'

# Production database has a global max query execution timeout setting. This 30 minute setting can be used
# to override the timeout for a specific session or query.
MAX_EXECUTION_TIME = 1_800_000
MAX_EXECUTION_TIME_SEC = MAX_EXECUTION_TIME / 1000

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

COMPARED_COLUMNS = [
  :id, :email, :opted_out, :dashboard_user_id, :name, :street_address, :city, :state, :country,
  :postal_code, :district_name, :district_city, :district_state, :district_zip, :school_name,
  :roles, :courses_facilitated, :professional_learning_enrolled, :professional_learning_attended,
  :hoc_organizer_years, :grades_taught, :ages_taught, :email_malformed, :forms_submitted,
  :form_roles, :opt_in
]

EXCLUDED_COLUMNS = [:email, :name]

DUMP_TABLE = :contact_rollups_future

def create_dump_table
  # PEGASUS_REPORTING_DB_WRITER.schema(DUMP_TABLE)
  # PEGASUS_REPORTING_DB_WRITER.drop_table(DUMP_TABLE)
  if PEGASUS_REPORTING_DB_WRITER.table_exists?(DUMP_TABLE)
    p "#{DUMP_TABLE} already exists"
  else
    PEGASUS_REPORTING_DB_WRITER.create_table DUMP_TABLE do
      Integer :id
      Integer :opted_out
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
      Integer :email_malformed
      String :forms_submitted, size: 4096
      String :form_roles, size: 4096
      Integer :opt_in

      unique :id
    end

    p "Created #{DUMP_TABLE} table"
  end
end

def compare_rows(columns, max_row_read = nil, max_row_write = nil)
  # Connect to 2 tables
  query = <<-SQL.squish
    select #{columns.join(',')} from contact_rollups order by id #{max_row_read ? "limit #{max_row_read}" : ''}
  SQL

  reporting_iter = PEGASUS_REPORTING_DB_READER[query].stream.to_enum
  production_iter = PEGASUS_DB_READER[query].stream.to_enum
  reporting_row = grab_next(reporting_iter)
  production_row = grab_next(production_iter)

  same_cnt = 0
  diff_cnt = 0
  not_there_cnt = 0
  diff_col_cnt = {}

  # Iterate through 2 tables, row by row
  # Compare id and email
  while reporting_row
    while reporting_row[:id] < production_row[:id]
      reporting_row = grab_next(reporting_iter)
      not_there_cnt += 1
    end
    break unless reporting_row

    reporting_values = reporting_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}
    production_values = production_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}

    changed_columns = {}
    columns.each do |col|
      next if reporting_values[col] == production_values[col]
      changed_columns[col] = production_values[col]
      diff_col_cnt[col] ||= 0
      diff_col_cnt[col] += 1
    end

    if changed_columns
      diff_cnt += 1
      PEGASUS_REPORTING_DB_WRITER[DUMP_TABLE].insert(changed_columns.except(*EXCLUDED_COLUMNS))
      # p "Diff #{diff_cnt}: reporting_values = #{reporting_values} != production_values = #{production_values}"

      break if max_row_write && (diff_cnt == max_row_write)
    else
      same_cnt += 1
    end

    reporting_row = grab_next(reporting_iter)
    production_row = grab_next(production_iter)
  end

  p "Done! Finished comparing #{same_cnt + diff_cnt + not_there_cnt} rows in reporting db and production db"
  p "Same rows = #{same_cnt}. Diff rows = #{diff_cnt}. Rows in reporting but not in production = #{not_there_cnt}."
  p "Column diff distribution:"
  columns.each do |col|
    puts "\t#{col}: #{diff_col_cnt[col]}"
  end
end

def grab_next(s)
  s.next
rescue StopIteration
  nil
rescue StandardError => error
  p "Error iterating over stream #{s} - #{error}"
  raise error
end

def main
  create_dump_table
  compare_rows(COMPARED_COLUMNS)
end

def test
  #load "../lib/cdo/cr_verify.rb"; test
  create_dump_table
  compare_rows([:id], 10)
  compare_rows([:id, :email], 10)
end

# test
main
