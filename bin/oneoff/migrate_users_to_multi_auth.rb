#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# Tested slice sizes of 10k, 1k, 100, 10, and 1, and 100 seemed to be the
# fastest per-user
SLICE_SIZE = 100

def migrate_batches(limit=nil)
  limit = limit.to_i if limit
  unmigrated_users = User.where.not(provider: User::PROVIDER_MIGRATED)
  unmigrated_users_count = 10_000_000 # estimate

  slice_count = 0
  puts "Migrating #{limit || 'all'} slice(s)"
  unmigrated_users.find_in_batches(batch_size: SLICE_SIZE) do |slice|
    puts "\tSLICE_COUNT: #{slice_count + 1} of #{limit || "~#{unmigrated_users_count / SLICE_SIZE}"}..."
    slice.each(&:migrate_to_multi_auth)
    slice_count += 1

    if limit && slice_count >= limit
      break
    end
  end
end

migrate_batches(*ARGV)
