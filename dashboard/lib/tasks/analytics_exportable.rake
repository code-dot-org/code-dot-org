# Rake tasks that drive the end-to-end "MySQL transactional data → Zero ETL →
# Redshift materialized view" pipeline. Everything lives under one
# `analytics_export:` namespace so the whole workflow is discoverable via
# `bundle exec rake -T analytics_export`. The `rds:` namespace is reserved for
# generic RDS infrastructure tasks (snapshots, parameter groups, etc.) and is
# intentionally not used here.
#
# IMPORTANT: These tasks inspect the local database schema to determine which
# tables can be replicated via Zero ETL and which Redshift materialized views to
# create. The output is then used to configure the managed test server and
# production Zero ETL integrations and Redshift materialized views.
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

namespace :analytics_export do
  # bundle exec rake 'analytics_export:sync_materialized_views[production]'
  # DRY_RUN=1 bundle exec rake 'analytics_export:sync_materialized_views[test]'
  desc "Sync Redshift materialized views for all exported models. Set DRY_RUN=1 to preview."
  task :sync_materialized_views, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:sync_materialized_views[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/materialized_view_generator'
    require 'cdo/aws/redshift/client'

    Rails.application.eager_load!

    errors = AnalyticsExportable.exportability_errors
    if errors.any?
      warn "[AnalyticsExportable] Skipping models that cannot be exported via Zero ETL:"
      errors.each {|msg| warn "  - #{msg}"}
      warn ""
    end

    models = AnalyticsExportable.valid_exported_models
    abort "No exportable models found." if models.empty?

    env = args[:environment_type].to_sym
    dry_run = ENV['DRY_RUN'].present?
    db_user = ENV.fetch('REDSHIFT_DB_USER', 'dev')

    client = Cdo::Aws::Redshift::Client.new(db_user: db_user)

    plan = Cdo::Aws::Redshift::MaterializedViewGenerator.sync_all_views(
      client: client,
      environment_type: env,
      models: models,
      dry_run: true
    )

    if plan[:to_add].any?
      puts "Add (#{plan[:to_add].length}):"
      plan[:to_add].each {|v| puts "  + #{v}"}
    end

    if plan[:to_update].any?
      puts "Update (#{plan[:to_update].length}):"
      plan[:to_update].each {|v| puts "  ~ #{v}"}
    end

    if plan[:unchanged].any?
      puts "Unchanged (#{plan[:unchanged].length}): DDL hash matches; will be skipped."
    end

    if plan[:to_drop].any?
      puts "Drop (#{plan[:to_drop].length}):"
      plan[:to_drop].each {|v| puts "  - #{v}"}
    end

    total = plan[:to_add].length + plan[:to_update].length + plan[:to_drop].length

    if total == 0
      puts "No changes needed."
      next
    end

    if dry_run
      puts "\n[DRY RUN] No changes applied."
      next
    end

    print "\nProceed? [y/N] "
    abort "Aborted." unless $stdin.gets&.strip&.downcase == 'y'

    puts "\nSubmitting..."
    started_at = Time.now

    result = Cdo::Aws::Redshift::MaterializedViewGenerator.sync_all_views(
      client: client,
      environment_type: env,
      models: models
    ) do |event, payload, extra|
      case event
      when :submitted
        puts "  submitted #{payload} (#{extra.length} view(s))"
      when :skipped
        puts "  skipping #{payload} (unchanged)"
      when :error
        warn "  submit FAILED for #{payload}: #{extra.class}: #{extra.message.lines.first&.strip}"
      when :drop_batch_submitted
        puts "  submitted DROP batch (#{payload.length} orphaned view(s))"
      end
    end

    statements = result[:statements] || {}

    if statements.empty?
      elapsed = (Time.now - started_at).round(1)
      puts "Done in #{elapsed}s. No statements to wait for."
      next
    end

    puts "\nWaiting for #{statements.length} statement(s) to complete (polls every 10s, Ctrl-C to detach — statements keep running on Redshift)..."

    wait_result = Cdo::Aws::Redshift::MaterializedViewGenerator.wait_for_statements(
      client: client,
      statements: statements
    ) do |event, fqn, detail|
      case event
      when :finished
        puts "  FINISHED  #{fqn} (#{detail}s)"
      when :failed
        puts "  FAILED    #{fqn} -- #{detail}"
      end
    end

    elapsed = (Time.now - started_at).round(1)
    puts "\nDone in #{elapsed}s. #{wait_result[:finished].length} finished, #{wait_result[:failed].length} failed."

    if result[:failed].any?
      warn "\n#{result[:failed].length} model(s) failed at submit time:"
      result[:failed].each {|t| warn "  - #{t}"}
    end

    exit 1 if result[:failed].any? || wait_result[:failed].any?
  end

  # bundle exec rake 'analytics_export:sync_status[production]'
  # HOURS_BACK=12 bundle exec rake 'analytics_export:sync_status[production]'
  # bundle exec rake 'analytics_export:sync_status[production]' > status.csv
  desc "Emit CSV (stdout) describing the most recent CREATE/DROP/REFRESH per Materialized View."
  task :sync_status, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:sync_status[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/materialized_view_generator'
    require 'cdo/aws/redshift/client'
    require 'csv'

    Rails.application.eager_load!

    env = args[:environment_type].to_s
    hours_back = ENV.fetch('HOURS_BACK', '24').to_i
    db_user = ENV.fetch('REDSHIFT_DB_USER', 'dev')

    client = Cdo::Aws::Redshift::Client.new(db_user: db_user)
    rows = Cdo::Aws::Redshift::MaterializedViewGenerator.view_status(
      client: client,
      environment_type: env,
      models: AnalyticsExportable.valid_exported_models,
      hours_back: hours_back
    )

    counts = rows.each_with_object(Hash.new(0)) {|r, h| h[r.status] += 1}
    expected_count = rows.count {|r| r.model_name != '(orphan)'}
    orphan_count = rows.length - expected_count

    warn "Materialized View sync status — env=#{env}, window=#{hours_back}h"
    warn "Rows: #{rows.length} (#{expected_count} expected, #{orphan_count} orphan)"
    warn "Status counts: #{counts.sort.map {|k, v| "#{v} #{k}"}.join(', ')}" unless counts.empty?

    CSV($stdout) do |csv|
      csv << %w[model table view_type operation executed_at statement_id status db_user]
      rows.each do |r|
        csv << [
          r.model_name,
          r.table_name,
          r.view_type,
          r.operation,
          r.executed_at&.iso8601,
          r.statement_id,
          r.status,
          r.db_user
        ]
      end
    end
  end

  # bundle exec rake 'analytics_export:zero_etl_data_filter[production]'
  desc "Print the Maxwell filter expression for the dashboard database in the given environment."
  task :zero_etl_data_filter, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:zero_etl_data_filter[environment_type]" if args[:environment_type].blank?
    puts AnalyticsExportable.zero_etl_data_filter(db_name: "dashboard_#{args[:environment_type]}")
  end

  # bundle exec rake 'analytics_export:update_zero_etl_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  # DRY_RUN=1 bundle exec rake 'analytics_export:update_zero_etl_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  desc "Reconcile Zero ETL integration excludes for the dashboard database. Set DRY_RUN=1 to preview."
  task :update_zero_etl_filter, [:integration_arn, :environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:update_zero_etl_filter[ARN,environment_type]" if args[:integration_arn].blank? || args[:environment_type].blank?

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
