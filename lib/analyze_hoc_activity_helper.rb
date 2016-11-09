#!/usr/bin/env ruby
#
# Helper methods for the analyze_hoc_activity cron job.
#
require File.expand_path('../../pegasus/src/env', __FILE__)
require src_dir 'database'
require 'cdo/properties'

DASHBOARD_REPORTING_DB_READONLY = sequel_connect(CDO.dashboard_reporting_db_reader, CDO.dashboard_reporting_db_reader)
PEGASUS_REPORTING_DB_READONLY = sequel_connect(CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader)

WEIGHTED_COUNT = "SUM(" \
  " IF(session REGEXP '^_.*_'," +
  # Parses the session weight 'xyz' from the session '_xyz_abcdefghijk'.
  "   SUBSTRING(SUBSTRING_INDEX(session, '_', 2) FROM 2)," +
  # The session does not specify the session weight, default to one.
  "   1)" \
  " ) AS count"

def generate_from_where(start_date, end_date: nil, tutorial: true, tutorial_pixel: true, finished: false)
  start_day = start_date.strftime('%Y-%m-%d')
  end_day = (end_date || start_date + 1).strftime('%Y-%m-%d')

  # The hoc_activities table has four columns we potentially care about;
  # activities logged by the tracking pixel use `pixel_started_at` and
  # `pixel_finished_at`, whereas activities logged by direct access
  # through our api use `started_at` and `finished_at`.
  #
  # This helper supports querying against any combination of pixel or
  # direct activities, either started or finished.
  field = finished ? 'finished_at' : 'started_at'

  filters = []
  filters.push("(#{field} >= '#{start_day}' AND #{field} < '#{end_day}')") if tutorial
  filters.push("(pixel_#{field} >= '#{start_day}' AND pixel_#{field} < '#{end_day}')") if tutorial_pixel

  "FROM hoc_activity" + (filters.empty? ? "" : " WHERE #{filters.join(' OR ')}")
end

def rank_tutorials(end_date)
  one_day = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{WEIGHTED_COUNT} #{generate_from_where(end_date - 1.day, end_date: end_date, tutorial_pixel: false)} GROUP BY tutorial ORDER BY count DESC"
  ).each_with_index do |row, index|
    next if row[:tutorial].nil_or_empty?
    one_day[row[:tutorial]] = index + 1
  end

  three_days = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{WEIGHTED_COUNT} #{generate_from_where(end_date - 3.days, end_date: end_date, tutorial_pixel: false)} GROUP BY tutorial ORDER BY count DESC"
  ).each_with_index do |row, index|
    next if row[:tutorial].nil_or_empty?
    three_days[row[:tutorial]] = index + 1
  end

  one_week = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{WEIGHTED_COUNT} #{generate_from_where(end_date - 1.week, end_date: end_date, tutorial_pixel: false)} GROUP BY tutorial ORDER BY count DESC"
  ).each_with_index do |row, index|
    next if row[:tutorial].nil_or_empty?
    one_week[row[:tutorial]] = index + 1
  end

  two_weeks = {}
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{WEIGHTED_COUNT} #{generate_from_where(end_date - 2.weeks, end_date: end_date, tutorial_pixel: false)} GROUP BY tutorial ORDER BY count DESC"
  ).each_with_index do |row, index|
    next if row[:tutorial].nil_or_empty?
    two_weeks[row[:tutorial]] = index + 1
  end

  {
    one_day: one_day,
    three_days: three_days,
    one_week: one_week,
    two_weeks: two_weeks,
  }
end

def analyze_day_fast(date)
  from_where = generate_from_where(date)
  finished_from_where = generate_from_where(date, finished: true)

  # Generate a list of Code.org tutorials so that we can generate the count for
  # Code.org hosted tutorials below.
  codedotorg_tutorials = []
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT code FROM tutorials WHERE orgname = 'Code.org'"
  ).each do |row|
    codedotorg_tutorials.push(row[:code])
  end

  codedotorg_tutorial_count = 0
  tutorials = Hash.new(0)
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT tutorial, #{WEIGHTED_COUNT} #{from_where} GROUP BY tutorial ORDER BY count DESC"
  ).each do |row|
    next if row[:tutorial].nil_or_empty?
    tutorials[row[:tutorial]] = row[:count].to_i
    if codedotorg_tutorials.include? row[:tutorial]
      codedotorg_tutorial_count += row[:count].to_i
    end
  end

  countries = Hash.new(0)
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT country, #{WEIGHTED_COUNT} #{from_where} GROUP BY country ORDER BY count DESC"
  ).each do |row|
    row[:country] = 'Other' if row[:country].nil_or_empty? || row[:country] == 'Reserved'
    countries[row[:country]] += row[:count].to_i
  end

  states = Hash.new(0)
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT state, #{WEIGHTED_COUNT} #{from_where} GROUP BY state ORDER BY count DESC"
  ).each do |row|
    row[:state] = 'Other' if row[:state].nil_or_empty? || row[:state] == 'Reserved'
    states[row[:state]] += row[:count].to_i
  end

  cities = Hash.new(0)
  PEGASUS_REPORTING_DB_READONLY.fetch(
    "SELECT city, #{WEIGHTED_COUNT} #{from_where} GROUP BY TRIM(CONCAT(city, ' ', state)) ORDER BY count DESC"
  ).each do |row|
    row[:city] = 'Other' if row[:city].nil_or_empty? || row[:city] == 'Reserved'
    cities[row[:city]] += row[:count].to_i
  end

  started = PEGASUS_REPORTING_DB_READONLY.fetch("SELECT #{WEIGHTED_COUNT} #{from_where}").first[:count].to_i

  finished = PEGASUS_REPORTING_DB_READONLY.fetch("SELECT #{WEIGHTED_COUNT} #{finished_from_where}").first[:count].to_i

  {
    'started' => started,
    'finished' => finished,
    'cities' => cities,
    'states' => states,
    'countries' => countries,
    'tutorials' => tutorials,
    'codedotorg_tutorial_count' => codedotorg_tutorial_count,
    'votes' => { 'boys' => '0', 'girls' => '0' },
  }
end

def add_hashes(h1, h2)
  unsorted = {}
  (h1.keys + h2.keys).uniq.each { |key| unsorted[key] = h1[key].to_i + h2[key].to_i }

  sorted = {}
  unsorted.keys.sort { |a, b| unsorted[b] <=> unsorted[a] }.each { |i| sorted[i] = unsorted[i] }
  sorted
end
