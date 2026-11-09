require_relative '../../../lib/cdo/data/logging/rake_task_event_logger'

include TimedTaskWithLogging

namespace :admin do
  desc 'Remove admin permissions from users who have not logged in for over 1 year (dry run by default, set EXECUTE=true to apply changes)'
  timed_task_with_logging remove_inactive_admins: :environment do
    dry_run = ENV['EXECUTE'] != 'true'
    one_year_ago = 1.year.ago

    success_count = 0
    error_count = 0
    errors = []

    inactive_admins_query = lambda do |cutoff|
      User.where(admin: true).
        where('current_sign_in_at < ? OR current_sign_in_at IS NULL', cutoff)
    end

    inactive_admins = ActiveRecord::Base.connected_to(role: :reporting) do
      inactive_admins_query.call(one_year_ago).to_a
    end

    total_count = inactive_admins.count

    if dry_run
      puts "=== DRY RUN MODE ==="
      puts "Found #{total_count} inactive admin users (not logged in since #{one_year_ago.strftime('%Y-%m-%d')})"
      puts "Run with EXECUTE=true to apply changes"
      puts "\nUsers who would be modified:"

      would_remove_count = 0
      would_skip_count = 0

      inactive_admins.each do |user|
        last_login = user.current_sign_in_at ? user.current_sign_in_at.strftime('%Y-%m-%d') : 'Never'
        user_type = user.user_type || 'unknown'

        if user.teacher?
          puts "  ✓ Would remove admin: ID: #{user.id}, Email: #{user.email}, Type: #{user_type}, Last login: #{last_login}"
          would_remove_count += 1
        else
          puts "  ⚠ Would skip (not teacher): ID: #{user.id}, Email: #{user.email}, Type: #{user_type}, Last login: #{last_login}"
          would_skip_count += 1
        end
      end

      puts "\n=== Summary ==="
      puts "Total inactive admins: #{total_count}"
      puts "Would remove admin from: #{would_remove_count}"
      puts "Would skip: #{would_skip_count}"
    else
      puts "=== LIVE MODE - Removing admin permissions ==="
      puts "Found #{total_count} inactive admin users to process"

      inactive_admins.each do |user|
        last_login = user.current_sign_in_at ? user.current_sign_in_at.strftime('%Y-%m-%d') : 'Never'

        unless user.teacher?
          puts "  ⚠ Skipping user #{user.id} (#{user.email}) - not a teacher (user_type: #{user.user_type})"
          error_count += 1
          errors << {id: user.id, email: user.email, reason: 'Not a teacher'}
          next
        end

        ActiveRecord::Base.connected_to(role: :writing) do
          user.update!(admin: false)
        end

        puts "  ✓ Removed admin from user #{user.id} (#{user.email}), Last login: #{last_login}"
        success_count += 1
      rescue => exception
        puts "  ✗ Error removing admin from user #{user.id} (#{user.email}): #{exception.message}"
        CDO.log.error "Failed to remove admin from user #{user.id}: #{exception.message}"
        error_count += 1
        errors << {id: user.id, email: user.email, reason: exception.message}
      end

      puts "\n=== Summary ==="
      puts "Total inactive admins found: #{total_count}"
      puts "Successfully removed admin: #{success_count}"
      puts "Errors: #{error_count}"

      if errors.any?
        puts "\nErrors encountered:"
        errors.each do |error|
          puts "  - User #{error[:id]} (#{error[:email]}): #{error[:reason]}"
        end
      end

      puts "\nNote: All changes have been automatically logged to Slack #infra-security and the security audit trail."
    end
  end
end
