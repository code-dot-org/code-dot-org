#!/usr/bin/env ruby
#
# This script analyzes the activity that is launched from code.org/learn. We track outgoing clicks,
# hidden image calls at the beginning and end of [3rd party] tutorials, and visits to our finish
# page.
#
# There is a lot of HOC data so, for performance, the script caches the totals for each day and only
# performs analysis on the remaining days. Deleting the cached results is an effective way to do
# a complete re-count. EXCEPT for HourOfActivity_Totals_2014-12-05.json which is a summary of all
# results for the year leading up to 12/05/2014.
#
# This script also caches values for the "about_stats" key in the Properties table. Unlike the HOC
# data, it is computed from scratch every time.
#
require File.expand_path('../../pegasus/src/env', __FILE__)
require 'cdo/hip_chat'
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
  froms = [
    "FROM hoc_activity WHERE (started_at >= '#{day}' AND started_at < '#{next_day}')" +
      " OR (pixel_started_at >= '#{day}' AND pixel_started_at < '#{next_day}')",
  ]

  finished_froms = [
    "FROM hoc_activity WHERE (finished_at >= '#{day}' AND finished_at < '#{next_day}')" +
      " OR (pixel_finished_at >= '#{day}' AND pixel_finished_at < '#{next_day}')",
  ]

  #HipChat.log "Analyzing by <b>tutorial</b>..." if rack_env?(:production)
  tutorials = {}
  froms.each do |from_where|
    PEGASUS_REPORTING_DB_READONLY.fetch(
      "SELECT tutorial, COUNT(id) as count #{from_where} GROUP BY tutorial ORDER BY count DESC"
    ).each do |row|
      next if row[:tutorial].nil_or_empty?
      add_count_to_hash tutorials, row[:tutorial], row[:count]
    end
  end

  #HipChat.log "Analyzing by <b>country</b>..." if rack_env?(:production)
  countries = {}
  froms.each do |from_where|
    PEGASUS_REPORTING_DB_READONLY.fetch(
      "SELECT country, COUNT(id) as count #{from_where} GROUP BY country ORDER BY count DESC"
    ).each do |row|
      row[:country] = 'Other' if row[:country].nil_or_empty? || row[:country] == 'Reserved'
      add_count_to_hash countries, row[:country], row[:count]
    end
  end

  #HipChat.log 'Analyzing by <b>state</b>...' if rack_env?(:production)
  states = {}
  froms.each do |from_where|
    PEGASUS_REPORTING_DB_READONLY.fetch(
      "SELECT state, COUNT(id) as count #{from_where} GROUP BY state ORDER BY count DESC"
    ).each do |row|
      row[:state] = 'Other' if row[:state].nil_or_empty? || row[:state] == 'Reserved'
      add_count_to_hash states, row[:state], row[:count]
    end
  end

  #HipChat.log 'Analyzing by <b>city</b>...' if rack_env?(:production)
  cities = {}
  froms.each do |from_where|
    PEGASUS_REPORTING_DB_READONLY.fetch(
      "SELECT city, COUNT(id) AS count #{from_where} GROUP BY TRIM(CONCAT(city, ' ', state)) ORDER BY count DESC"
    ).each do |row|
      row[:city] = 'Other' if row[:city].nil_or_empty? || row[:city] == 'Reserved'
      add_count_to_hash cities, row[:city], row[:count]
    end
  end

  #HipChat.log 'Calculating total started...' if rack_env?(:production)
  started = 0;
  froms.each do |from_where|
    started += PEGASUS_REPORTING_DB_READONLY.fetch("SELECT COUNT(id) as count #{from_where}").first[:count]
  end

  #HipChat.log 'Calculating total finished...' if rack_env?(:production)
  finished = 0;
  finished_froms.each do |from_where|
    finished += PEGASUS_REPORTING_DB_READONLY.fetch("SELECT COUNT(id) as count #{from_where}").first[:count]
  end

  {
    'started'=>started,
    'finished'=>finished,
    'cities'=>cities,
    'states'=>states,
    'countries'=>countries,
    'tutorials'=>tutorials,
    'votes'=>{ 'boys'=>'0', 'girls'=>'0' },
  }
end

def add_hashes(h1, h2)
  unsorted = {}
  (h1.keys + h2.keys).uniq.each { |key| unsorted[key] = h1[key].to_i + h2[key].to_i }
  unsorted

  sorted = {}
  unsorted.keys.sort { |a,b| unsorted[b] <=> unsorted[a] }.each { |i| sorted[i] = unsorted[i] }
  sorted
end
