# IMPORTANT: The tasks in this file (`zero_etl:data_filter`,
# `zero_etl:update_filter`, and `redshift:sync_materialized_views`) inspect the
# local database schema to determine which tables can be replicated via Zero
# ETL and which Redshift materialized views to create. The output is then used
# to configure the managed test server and production Zero ETL integrations and
# Redshift materialized views.
#
# Before running these against a non-development environment (e.g., `test` or
# `production`), make sure your local schema matches the target environment:
#
#   git switch staging && git pull
#   (cd dashboard && bundle exec rake db:migrate RAILS_ENV=development)
#
# A stale local schema will produce a stale filter expression (missing
# excludes for newly added tables, or stale excludes for tables that have
# since gained a primary key) and the wrong set of materialized views.

Rake::Task['db:migrate'].enhance do
  next unless Rails.env.development?

  Rails.application.eager_load!
  errors = AnalyticsExportable.exportability_errors
  next if errors.empty?

  warn "\n[AnalyticsExportable] The following models are declared as exportable but cannot be exported via Zero ETL:"
  errors.each {|msg| warn "  - #{msg}"}
  warn ""
end

namespace :zero_etl do
  # bundle exec rake 'zero_etl:data_filter[production]'
  desc "Print the Maxwell filter expression for the dashboard database."
  task :data_filter, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake zero_etl:data_filter[environment_type]" if args[:environment_type].blank?
    puts AnalyticsExportable.zero_etl_data_filter(db_name: "dashboard_#{args[:environment_type]}")
  end

  # bundle exec rake 'zero_etl:update_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  # DRY_RUN=1 bundle exec rake 'zero_etl:update_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  desc "Reconcile Zero ETL integration excludes for the dashboard database. Set DRY_RUN=1 to preview."
  task :update_filter, [:integration_arn, :environment_type] => :environment do |_t, args|
    abort "Usage: rake zero_etl:update_filter[ARN,environment_type]" if args[:integration_arn].blank? || args[:environment_type].blank?

    dry_run = ENV['DRY_RUN'].present?
    result = AnalyticsExportable.update_zero_etl_integration!(
      integration_arn: args[:integration_arn],
      db_name: "dashboard_#{args[:environment_type]}",
      dry_run: dry_run
    )

    if result[:to_remove].any?
      puts "Remove:"
      result[:to_remove].each {|r| puts "  - #{r}"}
    end

    if result[:to_add].any?
      puts "Add:"
      result[:to_add].each {|r| puts "  + #{r}"}
    end

    if result[:to_add].empty? && result[:to_remove].empty?
      puts "No changes needed."
    elsif dry_run
      puts "\n[DRY RUN] No changes applied."
    else
      puts "\nIntegration updated."
    end
  end
end
