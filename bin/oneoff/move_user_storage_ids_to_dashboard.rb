require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require 'optparse'

# To run: ruby bin/oneoff/move_user_storage_ids_to_dashboard.rb
# To revert: ruby bin/oneoff/move_user_storage_ids_to_dashboard.rb --revert

# Parse options
options = {
  revert: false,
}

OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage: #{File.basename(__FILE__)} [options]

    This moves the user_storage_ids table to the Dashboard DB and renames it to user_project_storage_ids

    Options:
  BANNER

  opts.on('--revert',
    'Will revert the Database to its previous state (drop the view and move the table back to Pegasus)'
  ) do |revert|
    options[:revert] = revert
  end

  opts.on('-h', '--help', 'Prints this help message') do
    puts opts
    exit
  end
end.parse!
puts "Options: #{options}"
options.freeze

$revert = options[:revert]

def migrate_user_storage_ids_to_dashboard
  pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
  dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym

  puts "Renaming table pegasus.user_storage_ids -> dashboard.user_project_storage_ids"
  # Rename the table to move it from the Pegasus schema to Dashboard
  # Also change the name from user_storage_ids to user_project_storage_ids
  DB.rename_table(pegasus_user_storage_ids, dashboard_user_project_storage_ids)

  puts "Creating view pegasus.user_storage_ids"
  # This view exists as a safe-guard during the time between when the table rename is applied
  # And the code referencing the new name is deployed, during that time queries to the old table name
  # will hit this view and query from the renamed table
  DB.create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
end

def revert_migrate_user_storage_ids_to_dashboard
  pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
  dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym

  puts "Dropping view pegasus.user_storage_ids"
  DB.drop_view(pegasus_user_storage_ids)

  puts "Renaming table dashboard.user_project_storage_ids -> pegasus.user_storage_ids"
  DB.rename_table(dashboard_user_project_storage_ids, pegasus_user_storage_ids)
end

if $revert
  revert_migrate_user_storage_ids_to_dashboard
else
  migrate_user_storage_ids_to_dashboard
end
