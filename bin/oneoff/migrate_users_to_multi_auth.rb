#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

SLICE_SIZE = 1_000

def migrate_batches(limit=nil)
  limit = limit.to_i if limit
  unmigrated_users = User.where.not(provider: User::PROVIDER_MIGRATED)
  unmigrated_users_count = 40_000_000 # estimate

  slice_count = 0
  puts "Migrating #{limit || 'all'} slice(s)"
  unmigrated_users.find_in_batches(batch_size: SLICE_SIZE) do |slice|
    puts "\tSLICE_COUNT: #{slice_count + 1} of ~#{unmigrated_users_count / SLICE_SIZE}..."
    ActiveRecord::Base.transaction do
      successes = 0
      slice.each do |user|
        user.migrate_to_multi_auth
        successes += 1 if user.valid? && user.provider == User::PROVIDER_MIGRATED
      end
      puts "\t\tsuccessful migrations: #{successes} / #{SLICE_SIZE}"
    end
    slice_count += 1

    if limit && slice_count >= limit
      break
    end
  end
end

migrate_batches(*ARGV)
