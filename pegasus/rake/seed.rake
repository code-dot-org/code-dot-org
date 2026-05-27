require lib_dir 'cdo/data/csv_to_sql_table'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :seed do
  desc 'import any CSV files that were modified since the last import'
  timed_task_with_logging :migrate do
    Dir.glob(pegasus_dir('data/*.csv')) {|i| CsvToSqlTable.new(i, PEGASUS_DB).import}
  end

  desc 'drop and import all CSV files'
  timed_task_with_logging :reset do
    Dir.glob(pegasus_dir('data/*.csv')) {|i| CsvToSqlTable.new(i, PEGASUS_DB).import!}
  end
end
