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
  desc "Print the Maxwell filter expression for the dashboard database."
  task data_filter: :environment do
    puts AnalyticsExportable.zero_etl_data_filter
  end

  desc "Reconcile Zero ETL integration excludes for the dashboard database. Set DRY_RUN=1 to preview."
  task :update_filter, [:integration_arn] => :environment do |_t, args|
    abort "Usage: rake zero_etl:update_filter[ARN]" if args[:integration_arn].blank?

    dry_run = ENV['DRY_RUN'].present?
    result = AnalyticsExportable.update_zero_etl_integration!(
      integration_arn: args[:integration_arn],
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
