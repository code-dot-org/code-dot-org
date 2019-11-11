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

def compare_rows(columns, row_cnt = nil)
  # Connect to 2 tables
  query = <<-SQL.squish
    select #{columns.join(',')} from contact_rollups order by id #{row_cnt ? "limit #{row_cnt}" : ''}
  SQL

  reporting_iter = PEGASUS_REPORTING_DB_READER[query].stream.to_enum
  production_iter = PEGASUS_DB_READER[query].stream.to_enum
  reporting_row = grab_next(reporting_iter)
  production_row = grab_next(production_iter)

  same_cnt = 0
  diff_cnt = 0

  # Iterate through 2 tables, row by row
  # Compare id and email
  # TODO: write logs to file
  while reporting_row
    reporting_values = reporting_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}
    production_values = production_row.slice(*columns).transform_values {|v| v.is_a?(String) ? v.downcase : v}
    if reporting_values != production_values
      diff_cnt += 1
      p "Diff #{diff_cnt}: reporting_values = #{reporting_values} != production_values = #{production_values}"
    else
      same_cnt += 1
    end

    reporting_row = grab_next(reporting_iter)
    production_row = grab_next(production_iter)
  end

  p "Done! Finished comparing #{same_cnt + diff_cnt} rows in reporting db and production db"
  p "Same rows = #{same_cnt}. Diff rows = #{diff_cnt}."
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
  compare_rows([:id], 10)
  compare_rows([:id, :email], 10)
  compare_rows([:id, :email])
end

main
