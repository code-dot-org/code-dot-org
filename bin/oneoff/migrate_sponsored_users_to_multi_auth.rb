#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# Conditionally enable verbose logging for better monitoring
unless (ARGV & %w(-v --verbose)).empty?
  ActiveRecord::Base.logger = Logger.new(STDOUT)
end

# The only effect that user.migrate_to_multi_auth has on sponsored users is to
# update the "provider" field to "migrated", so for simplicity we do all those
# directly with SQL
User.
  with_deleted. # ignore the deleted_at field so our SELECTs can use the provider index
  where(provider: User::PROVIDER_SPONSORED).
  in_batches(of: 1_000). # for some reason, a batch size of 1k works, but 10k doesn't
  update_all(provider: User::PROVIDER_MIGRATED)
