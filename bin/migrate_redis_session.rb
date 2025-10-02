#!/usr/bin/env ruby

# SESSION_STORE_MIGRATION_DELETE_ME
# We are migrating from session_store to redis. Its the same definitions, but with a new
# name to reflect that multiple dashboard features will be using the same instance.
#
# We expect the migration to be complete after November 2025, at which point we can remove
# this entire file (and delete session_store.yml.erb)

require_relative '../deployment'
require 'redis'

old_redis_url = CDO.old_session_store_server
new_redis_url = CDO.redis_url

raise "Old and new Redis URLs are the same!" if old_redis_url == new_redis_url

old_redis = Redis.new(url: old_redis_url)
new_redis = Redis.new(url: new_redis_url)

batch_size = 10000
migrated = 0
cursor = "0"

File.open('failed-migration-keys.log', 'a') do |failed_log|
  loop do
    puts "Starting batch at cursor #{cursor}"
    cursor, keys = old_redis.scan(cursor, match: "2::*", count: batch_size)

    puts "\tbatch reading #{keys.size} keys from old redis"
    sessions, ttls = old_redis.pipelined {|r| keys.each {|k| r.dump(k); r.pttl(k)}}.each_slice(2).to_a.transpose

    puts "\tbatch writing #{keys.size} keys to new redis"
    acks = new_redis.pipelined do |r|
      keys.zip(sessions, ttls).each do |key, session, ttl_ms|
        ttl_ms = 40 * 24 * 60 * 60 * 1000 if ttl_ms < 0  # default to 40 days if no TTL was set in old_redis
        r.restore("session:#{key}", ttl_ms, session, replace: true)
      end
    end

    succeeded = []
    failed = []
    keys.each_with_index do |k, i|
      (acks[i] == "OK" ? succeeded : failed) << k
    end

    failed.each {|k| failed_log.puts(k)}
    warn "\t#{failed.size} sessions FAILED TO MIGRATE, logged to failed-migration-keys.log" if failed.any?

    puts "\tbatch deleting #{succeeded.size} successfully migrated keys from old redis"
    # we use unlink because its an async delete, suitable for batches
    old_redis.pipelined {|p| succeeded.each {|k| p.unlink(k)}}

    migrated += keys.count
    puts "\tfinished this batch: #{keys.count} sessions migrated"
    puts "\toverall progress: #{migrated} sessions migrated in total"

    break if cursor == "0"
  end
end
