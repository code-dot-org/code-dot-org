# Rake tasks that drive the end-to-end "MySQL transactional data → Zero ETL → Redshift materialized view" pipeline:
#  analytics_export:zero_etl_data_filter[environment_type]                    # Print a table filter expression specifying which MySQL tables should be exported to Redshift via Zero ETL.
#  analytics_export:update_zero_etl_filter[integration_arn,environment_type]  # Update a Zero ETL Integration MySQL table filter based on which Models should be `exported_to_analytics`.
#  analytics_export:generate_materialized_view_templates                      # Regenerate the Materialized View SQL ERB templates from the current Models (no Redshift connection).
#  analytics_export:provision_materialized_views[environment_type]            # Provision Redshift Materialized Views for each Model which should be `exported_to_analytics`.
#  analytics_export:refresh_materialized_views[environment_type]              # REFRESH each Model's Redshift Materialized Views if they are stale.
#  analytics_export:materialized_view_status[environment_type]                # Output a CSV describing the status of each Model's Materialized View.
#
# IMPORTANT: These tasks should be executed by an engineer with administrative permissions to AWS on their local
# development environment because these tasks View/Update Relational Database Service Zero ETL Integrations and authenticate
# as a Redshift SQL user that has permissions to CREATE/DROP/REFRESH the target Zero ETL databases/tables in Redshift.
#   * `export AWS_PROFILE=codeorg-admin`
#   * ensure `CDO.redshift_username` is set to a SQL user that has permissions to CREATE/DROP/REFRESH Materialized Views
#  in the `dev.learning_platform_test/production` and `dev.learning_platform_test/production_pii` schemas (the views live
#  in the `dev` database; see `Cdo::Aws::Redshift::MaterializedViewManager::MATERIALIZED_VIEW_DATABASE`), and also the ability
#  to query Redshift system tables that store Zero ETL Integration status, Materialized View refresh status, and the
#  target Zero ETL databases.
#
# These tasks inspect the local database schema to determine which tables can be replicated via Zero ETL and which
# Redshift materialized views to create. The output is then used to configure the managed test server and production
# Zero ETL integrations and Redshift materialized views. Before running these against a non-development environment
# (e.g., `test` or `production`), make sure your local schema matches the target environment. A stale local schema will
# produce a stale filter expression (missing excludes for newly added tables, or stale excludes for tables that have
# since gained a primary key) and the wrong set of materialized views.

Rake::Task['db:migrate'].enhance do
  next unless Rails.env.development?

  begin
    require 'cdo/aws/redshift/materialized_view_manager'
  rescue LoadError
    warn "[devcontainer] Skipping Redshift DDL regeneration (no AWS credentials)" if ENV['AWS_EC2_METADATA_DISABLED']
    next
  end

  begin
    Rails.application.eager_load!
  rescue NameError
    warn "[devcontainer] Skipping Redshift DDL regeneration (no AWS credentials)" if ENV['AWS_EC2_METADATA_DISABLED']
    next
  end

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
    require 'csv'

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

    counts = rows.each_with_object(Hash.new(0)) {|r, h| h[r.status] += 1}
    expected_count = rows.count {|r| r.model_name != '(orphan)'}
    orphan_count = rows.length - expected_count

    warn "Materialized View status — env=#{env}, window=#{hours_back}h"
    warn "Rows: #{rows.length} (#{expected_count} expected, #{orphan_count} orphan)"
    warn "Status counts: #{counts.sort.map {|k, v| "#{v} #{k}"}.join(', ')}" unless counts.empty?

    # Surface failure detail to stderr so it's visible without opening the CSV. Group by the
    # error message, since a misconfiguration (e.g. a missing target schema) tends to fail
    # every view identically.
    failed = rows.select(&:error)
    unless failed.empty?
      warn "\nFailures (#{failed.length}):"
      failed.group_by(&:error).each do |error, group|
        sample = group.first
        warn "  #{group.length}× #{error}"
        warn "      e.g. #{sample.table_name} (#{sample.view_type}), statement #{sample.statement_id}"
      end
    end

    CSV($stdout) do |csv|
      csv << %w[
        model
        mysql_table_name
        view_type
        most_recent_operation
        operation_executed_at
        operation_duration_seconds
        redshift_statement_id
        operation_status
        redshift_db_user
        view_is_stale
        view_state
        view_state_description
        error
      ]
      rows.each do |r|
        csv << [
          r.model_name,
          r.table_name,
          r.view_type,
          r.operation,
          r.executed_at&.iso8601,
          r.duration_seconds&.round(1),
          r.statement_id,
          r.status,
          r.db_user,
          r.is_stale.nil? ? nil : r.is_stale.to_s,
          r.state,
          r.state_description,
          r.error
        ]
      end
    end
  end
end
