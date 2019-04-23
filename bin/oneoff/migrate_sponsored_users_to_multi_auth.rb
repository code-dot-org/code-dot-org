#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# Extend max query execution time; the default 30sec timeout is too short for
# our purposes
MAX_QUERY_EXECUTION_TIME = 1_200_000
ActiveRecord::Base.connection.execute "SET SESSION MAX_EXECUTION_TIME=#{MAX_QUERY_EXECUTION_TIME};"

# Conditionally enable verbose logging for better monitoring
unless (ARGV & %w(-v --verbose)).empty?
  ActiveRecord::Base.logger = Logger.new(STDOUT)
end

# The only effect that user.migrate_to_multi_auth has on sponsored users is to
# update the "provider" field to "migrated", so for simplicity we do all those
# directly with SQL
User.
  where(provider: User::PROVIDER_SPONSORED).
  in_batches(of: 100_000).
  update_all(provider: User::PROVIDER_MIGRATED)
