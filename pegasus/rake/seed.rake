require lib_dir 'cdo/data/csv_to_sql_table'
require lib_dir 'cdo/data/google_sheet_to_csv'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
$gdrive_ = nil
include TimedTaskWithLogging
namespace :seed do
  def gdrive
    $gdrive_ ||= Google::Drive.new
  end

  desc 'import any CSV files that were modified since the last import'
  timed_task_with_logging :migrate do
    Dir.glob(pegasus_dir('data/*.csv')) {|i| CsvToSqlTable.new(i, PEGASUS_DB).import}
  end

  desc 'drop and import all CSV files'
  task :reset do
    Dir.glob(pegasus_dir('data/*.csv')) {|i| CsvToSqlTable.new(i, PEGASUS_DB).import!}
  end

  desc 'download modified Google Sheets as CSV'
  task :sync_v3 do
    Dir.glob(pegasus_dir('data/*.gsheet')) {|i| GSheetToCsv.new(i).import}
  end

  desc 'download modified Google Sheets as CSV, and import any modified CSVs into the database'
  task sync: [:sync_v3, :migrate] do
  end
end
