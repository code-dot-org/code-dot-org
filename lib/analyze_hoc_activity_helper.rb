#!/usr/bin/env ruby
#
# Helper methods for the analyze_hoc_activity cron job.
#
require File.expand_path('../../pegasus/src/env', __FILE__)
require src_dir 'database'
require 'cdo/properties'

DASHBOARD_REPORTING_DB_READONLY = sequel_connect(CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader)
PEGASUS_REPORTING_DB_READONLY = sequel_connect(CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader)

def add_count_to_hash(hash, key, count)
  hash[key] = hash.has_key?(key) ? hash[key] + count : count
end

def analyze_day_fast(date)
  day = date.strftime('%Y-%m-%d')
  next_day = (date + 1).strftime('%Y-%m-%d')

  weighted_count = "SUM(" +
    " IF(session REGEXP '^_.*_'," +
    # Parses the session weight 'xyz' from the session '_xyz_abcdefghijk'.
    "   SUBSTRING(SUBSTRING_INDEX(session, '_', 2) FROM 2)," +
    # The session does not specify the session weight, default to one.
    "   1)" +
    " ) AS count"
  from_where = "FROM hoc_activity" +
    " WHERE (started_at >= '#{day}' AND started_at < '#{next_day}')" +
    "   OR (pixel_started_at >= '#{day}' AND pixel_started_at < '#{next_day}')"
  finished_from_where = "FROM hoc_activity" +
    " WHERE (finished_at >= '#{day}' AND finished_at < '#{next_day}')" +
    "   OR (pixel_finished_at >= '#{day}' AND pixel_finished_at < '#{next_day}')"

  # Generate a list of Code.org tutorials so that we can generate the count for
  # Code.org hosted tutorials below.
  codedotorg_tutorials = []
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT code FROM tutorials WHERE orgname = 'Code.org'"
  ).each do |row|
    codedotorg_tutorials.push(row[:code])
  end

  codedotorg_tutorial_count = 0
  tutorials = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{weighted_count} #{from_where} GROUP BY tutorial ORDER BY count DESC"
  ).each do |row|
    next if row[:tutorial].nil_or_empty?
    add_count_to_hash tutorials, row[:tutorial], row[:count].to_i
    if codedotorg_tutorials.include? row[:tutorial]
      codedotorg_tutorial_count += row[:count].to_i
    end
  end

  countries = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT country, #{weighted_count} #{from_where} GROUP BY country ORDER BY count DESC"
  ).each do |row|
    row[:country] = 'Other' if row[:country].nil_or_empty? || row[:country] == 'Reserved'
    add_count_to_hash countries, row[:country], row[:count].to_i
  end

  states = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT state, #{weighted_count} #{from_where} GROUP BY state ORDER BY count DESC"
  ).each do |row|
    row[:state] = 'Other' if row[:state].nil_or_empty? || row[:state] == 'Reserved'
    add_count_to_hash states, row[:state], row[:count].to_i
  end

  cities = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT city, #{weighted_count} #{from_where} GROUP BY TRIM(CONCAT(city, ' ', state)) ORDER BY count DESC"
  ).each do |row|
    row[:city] = 'Other' if row[:city].nil_or_empty? || row[:city] == 'Reserved'
    add_count_to_hash cities, row[:city], row[:count].to_i
  end

  started = PEGASUS_REPORTING_DB_READONLY.fetch("SELECT #{weighted_count} #{from_where}").first[:count].to_i

  finished = PEGASUS_REPORTING_DB_READONLY.fetch("SELECT #{weighted_count} #{finished_from_where}").first[:count].to_i

  {
    'started'=>started,
    'finished'=>finished,
    'cities'=>cities,
    'states'=>states,
    'countries'=>countries,
    'tutorials'=>tutorials,
    'codedotorg_tutorial_count'=>codedotorg_tutorial_count,
    'votes'=>{ 'boys'=>'0', 'girls'=>'0' },
  }
end

def add_hashes(h1, h2)
  unsorted = {}
  (h1.keys + h2.keys).uniq.each { |key| unsorted[key] = h1[key].to_i + h2[key].to_i }

  sorted = {}
  unsorted.keys.sort { |a,b| unsorted[b] <=> unsorted[a] }.each { |i| sorted[i] = unsorted[i] }
  sorted
end
