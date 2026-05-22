#!/usr/bin/env -S bundle exec ruby
# frozen_string_literal: true

require 'pathname'

require_relative 'src/report_analysis'
require_relative 'src/generate_cache_miss_maker_json'

SCRIPT_DIR = Pathname(__dir__).realpath
REPORT_FILENAME = 'daily-odds-of-file-change-report.md'
REPORT_PATH = SCRIPT_DIR / REPORT_FILENAME

def append_graph(lines, miss_days)
  average, median, hit_pct, miss_pct = ReportAnalysis.graph_stats(miss_days)
  lines << format("Average days between changes: `%.2f`  ", average)
  lines << format("Median days between changes: `%.2f`  ", median)
  lines << format("Cache hit days: `%.2f%%`  ", hit_pct)
  lines << format("Cache miss days: `%.2f%%`", miss_pct)
  lines << ''
  lines << 'Days between file changes:'
  lines << ''
  lines << '```text'
  ReportAnalysis.weighted_gap_rows_with_bars(miss_days).each do |count_label, day_label, weighted_label, bar|
    lines << "#{count_label}  #{day_label}   #{bar} = #{weighted_label}".rstrip
  end
  lines << '```'
  lines << ''
end

def append_daily_6am_report(lines, commit_cache)
  file_groups = ReportAnalysis.resolved_file_groups
  miss_day_cache = ReportAnalysis.build_miss_day_cache(commit_cache)

  lines << '# Dockerfile Git Change Frequency Analysis (6am Pacific Daily Build Basis)'
  lines << ''
  lines << "Window: #{ReportAnalysis::WINDOW_START_DATE.iso8601} to #{ReportAnalysis::WINDOW_END_DATE.iso8601}.  "
  lines << "Method: for each day at 6:00am Pacific, compare the relevant `COPY` inputs to the previous day's 6:00am Pacific snapshot. If any commit landed in that 24-hour checkpoint window, that day is a cache miss. The report below groups exact day spans between those miss days, including boundary spans so the weighted total covers the full 365-day window."
  lines << ''
  lines << '## Days Between Git Changes'
  lines << ''

  file_groups.each do |dockerfile, paths|
    overall_miss_days = paths.flat_map {|path| miss_day_cache.fetch(path)}.uniq.sort
    hist = ReportAnalysis.span_histogram_from_miss_days(overall_miss_days)
    weighted_sum = hist.sum {|days, count| days * count}
    raise "#{dockerfile} weighted span sum #{weighted_sum} does not match #{ReportAnalysis::WINDOW_DAYS}" if (weighted_sum - ReportAnalysis::WINDOW_DAYS).abs > 1

    lines << "### `#{dockerfile}`"
    lines << ''
    append_graph(lines, overall_miss_days)
  end

  lines << '### Details about each COPY pattern'
  lines << ''
  file_groups.each do |dockerfile, paths|
    overall_miss_days = paths.flat_map {|path| miss_day_cache.fetch(path)}.uniq.sort
    lines << "#### `#{dockerfile}`"
    lines << ''
    lines << '##### `OVERALL`'
    lines << ''
    append_graph(lines, overall_miss_days)

    paths.each do |path|
      lines << "##### `#{path}`"
      lines << ''
      append_graph(lines, miss_day_cache.fetch(path))
    end
  end
end

def write_report(filename)
  lines = []
  yield lines
  (SCRIPT_DIR / filename).write(lines.join("\n") + "\n")
end

def main
  file_groups = ReportAnalysis.resolved_file_groups
  commit_cache = ReportAnalysis.build_commit_cache(file_groups)
  miss_day_cache = ReportAnalysis.build_miss_day_cache(commit_cache)

  write_report(REPORT_FILENAME) do |lines|
    append_daily_6am_report(lines, commit_cache)
  end

  json_path = GenerateCacheMissMakerJson.write_cache_miss_maker_json(
    SCRIPT_DIR,
    file_groups,
    ReportAnalysis::COPY_PATH_DEPENDENCIES,
    miss_day_cache,
    ReportAnalysis::WINDOW_DAYS
  )

  puts 'Wrote report:'
  puts "  #{REPORT_PATH}"
  puts 'Wrote daily odds json:'
  puts "  #{json_path}"
end

main if $PROGRAM_NAME == __FILE__
