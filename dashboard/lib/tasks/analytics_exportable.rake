# Rake tasks that drive the end-to-end "MySQL transactional data → Zero ETL → Redshift materialized view" pipeline:
#  analytics_export:zero_etl_data_filter[environment_type]                    # Print a table filter expression specifying which MySQL tables should be exported to Redshift via Zero ETL.
#  analytics_export:update_zero_etl_filter[integration_arn,environment_type]  # Update a Zero ETL Integration MySQL table filter based on which Models should be `exported_to_analytics`.
#  analytics_export:resync_zero_etl_table[table_names,environment_type]       # Resync one or more (space-separated) tables that failed to replicate via Zero ETL.
#  analytics_export:zero_etl_export_status[environment_type]                  # Report the Zero ETL replication status of every table we export to analytics.
#  analytics_export:configure_zero_etl_target_database[environment_type]      # Apply the required Zero ETL ingestion settings (ACCEPTINVCHARS, TRUNCATECOLUMNS) to the target database.
#  analytics_export:generate_materialized_view_templates                      # Regenerate the Materialized View SQL ERB templates from the current Models (no Redshift connection).
#  analytics_export:provision_materialized_views[environment_type]            # Provision Redshift Materialized Views for each Model which should be `exported_to_analytics`.
#  analytics_export:refresh_materialized_views[environment_type]              # REFRESH each Model's Redshift Materialized Views if they are stale.
#  analytics_export:materialized_view_status[environment_type]                # Output a CSV describing the status of each Model's Materialized View.
#
# IMPORTANT: These tasks should be executed by an engineer with administrative permissions to AWS on their local
# development environment (`export AWS_PROFILE=codeorg-admin`). They authenticate to Redshift as `CDO.redshift_username`,
# and the required Redshift privilege differs by task — set `CDO.redshift_username` accordingly:
#
#   * Materialized-view tasks (generate/provision/refresh/status): run as the MV owner (`etl_client`), which has
#     CREATE/DROP/REFRESH on the `dev.learning_platform_<env>` / `_pii` schemas (the views live in the `dev` database;
#     see `Cdo::Aws::Redshift::MaterializedViewManager::MATERIALIZED_VIEW_DATABASE`) plus read on the Zero ETL status
#     system tables.
#   * Target-database tasks (`configure_zero_etl_target_database`, `resync_zero_etl_table`): run as the Redshift
#     SUPERUSER. Both issue `ALTER DATABASE <target> INTEGRATION ...` against the raw Zero ETL target database, which
#     holds the full UNFILTERED dataset (all PII/highly-restricted rows). We intentionally keep write access there
#     superuser-only rather than granting `etl_client` ownership; see `Cdo::Aws::Redshift::ZeroEtl`.
#   * The `update_zero_etl_filter` task additionally needs RDS API permission to describe/modify the integration.
#
# These tasks inspect the local database schema to determine which tables can be replicated via Zero ETL and which
# Redshift materialized views to create. The output is then used to configure the managed test server and production
# Zero ETL integrations and Redshift materialized views. Before running these against a non-development environment
# (e.g., `test` or `production`), make sure your local schema matches the target environment. A stale local schema will
# produce a stale filter expression (missing excludes for newly added tables, or stale excludes for tables that have
# since gained a primary key) and the wrong set of materialized views.

Rake::Task['db:migrate'].enhance do
  next unless Rails.env.development?

  require 'cdo/aws/redshift/materialized_view_manager'
  Rails.application.eager_load!

  # Regenerate the Zero ETL materialized-view SQL ERB templates so a migration that reshapes an
  # exported table surfaces the pending view change as a committable `.sql.erb` diff. We deliberately
  # do NOT rebuild the views: Redshift can't ALTER a materialized view, so a schema or data
  # classification change needs a coordinated DROP/CREATE (`analytics_export:provision_materialized_views`)
  # scheduled with the Infrastructure and RED teams. Regenerating the template only flags the change
  # (review `git status aws/redshift/zeroetl_materialized_views`); it touches no Redshift.
  Cdo::Aws::Redshift::MaterializedViewManager.generate_all_ddl_templates(
    models: AnalyticsExportable.valid_exported_models
  )

  errors = AnalyticsExportable.exportability_errors
  next if errors.empty?

  warn "\n[AnalyticsExportable] The following models are declared as exportable but cannot be exported via Zero ETL:"
  errors.each {|msg| warn "  - #{msg}"}
  warn ""
end

namespace :analytics_export do
  # bundle exec rake 'analytics_export:zero_etl_data_filter[production]'
  desc "Print the table filter expression specifying which MySQL tables should be exported to Redshift via Zero ETL."
  task :zero_etl_data_filter, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:zero_etl_data_filter[environment_type]" if args[:environment_type].blank?
    puts AnalyticsExportable.zero_etl_data_filter(db_name: "dashboard_#{args[:environment_type]}")
  end

  # bundle exec rake 'analytics_export:update_zero_etl_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  # DRY_RUN=1 bundle exec rake 'analytics_export:update_zero_etl_filter[arn:aws:rds:us-east-1:ACCOUNT:integration:ID,production]'
  desc "Update a Zero ETL Integration MySQL table filter based on which Models should be `exported_to_analytics`."
  task :update_zero_etl_filter, [:integration_arn, :environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:update_zero_etl_filter[ARN,environment_type]" if args[:integration_arn].blank? || args[:environment_type].blank?

    require 'cdo/aws/rds'

    db_name = "dashboard_#{args[:environment_type]}"
    dry_run = ENV['DRY_RUN'].present?
    # AnalyticsExportable computes the desired filter from the schema; Cdo::RDS reads/reconciles/writes
    # it against the live integration via the RDS API.
    result = Cdo::RDS.update_zero_etl_integration!(
      integration_arn: args[:integration_arn],
      desired_data_filter: AnalyticsExportable.zero_etl_data_filter(db_name: db_name),
      db_name: db_name,
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

  # bundle exec rake 'analytics_export:resync_zero_etl_table[table_name,production]'
  # bundle exec rake 'analytics_export:resync_zero_etl_table[table_one table_two,production]'
  desc "Resync one or more (space-separated) tables that failed to replicate via Zero ETL, e.g. after fixing a missing primary key."
  task :resync_zero_etl_table, [:table_names, :environment_type] => :environment do |_t, args|
    if args[:table_names].blank? || args[:environment_type].blank?
      abort "Usage: rake analytics_export:resync_zero_etl_table[table_names,environment_type]"
    end

    require 'cdo/aws/redshift/zero_etl'
    require 'cdo/aws/redshift/materialized_view_manager'

    environment_type = args[:environment_type]
    table_names = args[:table_names].split(/\s+/)
    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client

    begin
      statement_id = Cdo::Aws::Redshift::ZeroEtl.resync_tables(
        client: client, environment_type: environment_type, table_names: table_names
      )
      client.wait_for_completion(statement_id)
    rescue Cdo::Aws::Redshift::Client::QueryError => exception
      # `ALTER DATABASE ... INTEGRATION REFRESH` is a control command: on failure the Data API
      # statement carries no error detail. The actionable reason is in SVV_INTEGRATION_TABLE_STATE,
      # so surface it here rather than leaving the operator with an empty "Statement FAILED".
      warn "Resync request failed: #{exception.message}"
      states = Cdo::Aws::Redshift::ZeroEtl.table_states(
        client: client, environment_type: environment_type, table_names: table_names
      )
      warn "\nCurrent Zero ETL state (SVV_INTEGRATION_TABLE_STATE):"
      if states.empty?
        warn "  (no rows for #{table_names.join(', ')} — check the table name and environment)"
      else
        states.each do |table|
          warn "  #{table['schema_name']}.#{table['table_name']} state=#{table['table_state']} reason=#{table['reason']}"
        end
      end
      abort "\nResync did not start; resolve the reason above (the table won't replicate until it's fixed)."
    end

    puts "Resync requested for #{table_names.join(', ')}."
    puts 'Each table is unavailable in Redshift while it resyncs; poll SVV_INTEGRATION_TABLE_STATE ' \
      '(or `analytics_export:materialized_view_status`) to watch it return to `Synced`.'
  end

  # bundle exec rake 'analytics_export:zero_etl_export_status[production]'
  desc "Report the Zero ETL replication status (SVV_INTEGRATION_TABLE_STATE) of every table we export to analytics."
  task :zero_etl_export_status, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:zero_etl_export_status[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/zero_etl'
    require 'cdo/aws/redshift/materialized_view_manager'
    Rails.application.eager_load!

    env = args[:environment_type]
    exported_tables = AnalyticsExportable.valid_exported_models.to_set(&:table_name)

    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client
    rows_by_table = Cdo::Aws::Redshift::ZeroEtl.all_table_states(client: client, environment_type: env).
      index_by {|row| row['table_name']}

    by_state = Hash.new(0)
    missing = []
    unhealthy = []
    exported_tables.sort.each do |table|
      row = rows_by_table[table]
      # No SVV row means Zero ETL isn't replicating this exported table at all (e.g. excluded as
      # incompatible, or not yet discovered) — a gap worth surfacing distinctly from a bad state.
      next missing << table if row.nil?

      by_state[row['table_state']] += 1
      unhealthy << row unless Cdo::Aws::Redshift::ZeroEtl::HEALTHY_TABLE_STATES.include?(row['table_state'])
    end

    puts "Zero ETL replication status — env=#{env}, #{exported_tables.size} exported table(s)"
    puts "By state: #{by_state.sort.map {|state, count| "#{count} #{state}"}.join(', ')}" unless by_state.empty?

    unless unhealthy.empty?
      puts "\nNot in a healthy state (#{unhealthy.length}):"
      unhealthy.each {|row| puts "  #{row['schema_name']}.#{row['table_name']} #{row['table_state']} reason=#{row['reason']}"}
    end

    unless missing.empty?
      puts "\nNot replicating — no integration row (#{missing.length}):"
      missing.sort.each {|table| puts "  #{table}"}
    end
  end

  # bundle exec rake 'analytics_export:configure_zero_etl_target_database[production]'
  desc "Apply the required Zero ETL ingestion settings (ACCEPTINVCHARS, TRUNCATECOLUMNS) to the target database. Run after (re)creating it."
  task :configure_zero_etl_target_database, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:configure_zero_etl_target_database[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/zero_etl'
    require 'cdo/aws/redshift/materialized_view_manager'

    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client
    sql = Cdo::Aws::Redshift::ZeroEtl.apply_required_integration_settings(
      client: client, environment_type: args[:environment_type]
    )

    puts "Applied: #{sql}"
    puts 'Affects ingestion going forward only. Resync already-failed tables ' \
      '(`analytics_export:resync_zero_etl_table`) to re-ingest them under the new settings.'
  end

  # bundle exec rake analytics_export:generate_materialized_view_templates
  desc "Regenerate the Materialized View SQL ERB templates from the current Models (no Redshift connection)."
  task generate_materialized_view_templates: :environment do
    require 'cdo/aws/redshift/materialized_view_manager'
    Rails.application.eager_load!

    result = Cdo::Aws::Redshift::MaterializedViewManager.generate_all_ddl_templates(
      models: AnalyticsExportable.valid_exported_models
    )
    puts "Wrote #{result[:written].length} template(s) to #{Cdo::Aws::Redshift::MaterializedViewManager::SQL_VIEW_TEMPLATE_DIR}."
    next if result[:deleted].empty?

    puts "Pruned #{result[:deleted].length} orphaned template(s):"
    result[:deleted].sort.each {|path| puts "  #{File.basename(path)}"}
  end

  # bundle exec rake 'analytics_export:provision_materialized_views[production]'
  # DRY_RUN=1 bundle exec rake 'analytics_export:provision_materialized_views[test]'
  desc "Provision Redshift Materialized Views for each Model which should be `exported_to_analytics`."
  task :provision_materialized_views, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:provision_materialized_views[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/materialized_view_manager'
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

    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client

    plan = Cdo::Aws::Redshift::MaterializedViewManager.provision_all_views(
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

    result = Cdo::Aws::Redshift::MaterializedViewManager.provision_all_views(
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

    wait_result = client.wait_for_statements(
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

  # bundle exec rake 'analytics_export:refresh_materialized_views[production]'
  # DRY_RUN=1 bundle exec rake 'analytics_export:refresh_materialized_views[test]'
  desc "REFRESH each Model's Redshift Materialized Views if they are stale."
  task :refresh_materialized_views, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:refresh_materialized_views[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/materialized_view_manager'
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

    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client

    # Phase 1: dry-run preview — group models into stale / fresh / no_views
    # without touching Redshift beyond the SVV_MV_INFO catalog read.
    would_refresh = {}
    skipped = []
    no_views = []
    Cdo::Aws::Redshift::MaterializedViewManager.refresh_all_views(
      client: client, environment_type: env, models: models, dry_run: true
    ) do |event, table_name, payload|
      case event
      when :would_refresh
        would_refresh[table_name] = payload
      when :skipped
        skipped << table_name
      when :no_views
        no_views << table_name
      end
    end

    if would_refresh.any?
      puts "Stale (#{would_refresh.length} model(s)):"
      would_refresh.each {|table, fqns| puts "  ~ #{table} (#{fqns.length} view(s))"}
    end

    puts "Fresh (will be skipped): #{skipped.length} model(s)." unless skipped.empty?
    puts "No views: #{no_views.length} model(s)." unless no_views.empty?

    if would_refresh.empty?
      puts "Nothing to refresh."
      next
    end

    if dry_run
      puts "\n[DRY RUN] No statements submitted."
      next
    end

    print "\nProceed? [y/N] "
    abort "Aborted." unless $stdin.gets&.strip&.downcase == 'y'

    puts "\nSubmitting REFRESH for #{would_refresh.length} model(s)..."
    started_at = Time.now

    result = Cdo::Aws::Redshift::MaterializedViewManager.refresh_all_views(
      client: client, environment_type: env, models: models
    ) do |event, payload, extra|
      case event
      when :submitted
        puts "  submitted #{payload} (#{extra.length} view(s))"
      when :error
        warn "  submit FAILED for #{payload}: #{extra.class}: #{extra.message.lines.first&.strip}"
      end
    end

    statements = result[:statements] || {}

    if statements.empty?
      elapsed = (Time.now - started_at).round(1)
      puts "Done in #{elapsed}s. No statements to wait for."
      next
    end

    puts "\nWaiting for #{statements.length} statement(s) to complete (polls every 10s, Ctrl-C to detach — statements keep running on Redshift)..."

    wait_result = client.wait_for_statements(
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

  # bundle exec rake 'analytics_export:materialized_view_status[production]'
  # HOURS_BACK=12 bundle exec rake 'analytics_export:materialized_view_status[production]'
  # bundle exec rake 'analytics_export:materialized_view_status[production]' > status.csv
  desc "Output a CSV describing the status of each Model's Materialized View."
  task :materialized_view_status, [:environment_type] => :environment do |_t, args|
    abort "Usage: rake analytics_export:materialized_view_status[environment_type]" if args[:environment_type].blank?

    require 'cdo/aws/redshift/materialized_view_manager'
    require 'cdo/aws/redshift/client'

    Rails.application.eager_load!

    env = args[:environment_type].to_s
    hours_back = ENV.fetch('HOURS_BACK', '24').to_i

    client = Cdo::Aws::Redshift::MaterializedViewManager.redshift_client
    rows = Cdo::Aws::Redshift::MaterializedViewManager.view_status(
      client: client,
      environment_type: env,
      models: AnalyticsExportable.valid_exported_models,
      hours_back: hours_back
    )

    summary = Cdo::Aws::Redshift::MaterializedViewManager.summarize_view_status(rows)

    warn "Materialized View status — env=#{env}, window=#{hours_back}h"
    warn "Rows: #{rows.length} (#{summary[:expected]} expected, #{summary[:orphan]} orphan)"
    unless summary[:by_status].empty?
      warn "Status counts: #{summary[:by_status].sort.map {|status, count| "#{count} #{status}"}.join(', ')}"
    end

    # Surface failure detail to stderr so it's visible without opening the CSV. Grouped by the
    # error message, since a misconfiguration (e.g. a missing target schema) tends to fail
    # every view identically.
    failures_by_error = summary[:failures_by_error]
    unless failures_by_error.empty?
      warn "\nFailures (#{failures_by_error.values.sum(&:length)}):"
      failures_by_error.each do |error, group|
        sample = group.first
        warn "  #{group.length}× #{error}"
        warn "      e.g. #{sample.table_name} (#{sample.view_type}), statement #{sample.statement_id}"
      end
    end

    $stdout.write(Cdo::Aws::Redshift::MaterializedViewManager.view_status_to_csv(rows))
  end
end
