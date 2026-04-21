# frozen_string_literal: true

require 'date'
require 'pathname'
require 'set'
require 'time'

require_relative 'derive-dependencies'

module ReportAnalysis
  CommitRecord = Struct.new(:ts, :commit_hash, keyword_init: true)

  SCRIPT_DIR = Pathname(__dir__).realpath.parent
  REPO_ROOT = SCRIPT_DIR.parent.parent.parent
  WINDOW_START_DATE = Date.new(2025, 3, 14)
  WINDOW_END_DATE = Date.new(2026, 3, 14)
  WINDOW_DAYS = (WINDOW_END_DATE - WINDOW_START_DATE).to_i
  WINDOW_START_DT = Time.utc(2025, 3, 14, 0, 0, 0)
  WINDOW_END_DT = Time.utc(2026, 3, 14, 23, 59, 59)
  DOCKERFILE_DEPENDENCIES, COPY_PATH_DEPENDENCIES = DeriveDependencies.generate_dependency_maps

  module_function def git_output(*args)
    output = IO.popen(%w[git] + args, chdir: REPO_ROOT.to_s, &:read)
    status = $?
    raise "git #{args.join(' ')} failed" unless status&.success?

    output
  end

  module_function def resolved_file_groups
    resolved = {}
    resolver = lambda do |dockerfile|
      return resolved[dockerfile] if resolved.key?(dockerfile)

      paths = []
      DOCKERFILE_DEPENDENCIES.fetch(dockerfile, []).each do |dep|
        resolver.call(dep).each do |path|
          paths << path unless paths.include?(path)
        end
      end

      COPY_PATH_DEPENDENCIES.fetch(dockerfile).each do |path|
        paths << path unless paths.include?(path)
      end

      resolved[dockerfile] = paths
    end

    COPY_PATH_DEPENDENCIES.each_key {|dockerfile| resolver.call(dockerfile)}
    COPY_PATH_DEPENDENCIES.keys.to_h {|dockerfile| [dockerfile, resolved.fetch(dockerfile)]}
  end

  module_function def git_commits(path)
    out = git_output('log', "--format=%ct\t%H", '--reverse', '--', path)
    commits = []
    seen = Set.new

    out.each_line do |line|
      next if line.strip.empty?

      ts_s, commit_hash = line.split("\t", 2)
      next if ts_s.nil? || commit_hash.nil?

      commit_hash = commit_hash.strip
      next if seen.include?(commit_hash)

      seen << commit_hash
      ts = Time.at(Integer(ts_s)).utc
      next unless ts >= WINDOW_START_DT && ts <= WINDOW_END_DT

      commits << CommitRecord.new(ts: ts, commit_hash: commit_hash)
    end

    commits
  end

  module_function def with_pacific_time
    previous = ENV.fetch('TZ', nil)
    ENV['TZ'] = 'America/Los_Angeles'
    yield
  ensure
    ENV['TZ'] = previous
  end

  module_function def daily_6am_miss_days(commits)
    miss_days = Set.new

    commits.each do |commit|
      local = with_pacific_time {commit.ts.getlocal}
      seconds_since_midnight = (local.hour * 3600) + (local.min * 60) + local.sec
      miss_day = local.to_date
      miss_day += 1 if seconds_since_midnight > 21_600

      miss_days << miss_day if miss_day > WINDOW_START_DATE && miss_day <= WINDOW_END_DATE
    end

    miss_days.to_a.sort
  end

  module_function def span_histogram_from_miss_days(miss_days)
    anchors = [WINDOW_START_DATE] + miss_days + [WINDOW_END_DATE]
    spans = anchors.each_cons(2).map {|a, b| (b - a).to_i}.select(&:positive?)
    counts = spans.tally
    counts.keys.sort.map {|gap| [gap, counts.fetch(gap)]}
  end

  module_function def spans_from_miss_days(miss_days)
    anchors = [WINDOW_START_DATE] + miss_days + [WINDOW_END_DATE]
    anchors.each_cons(2).map {|a, b| (b - a).to_i}.select(&:positive?)
  end

  module_function def graph_stats(miss_days)
    spans = spans_from_miss_days(miss_days)
    average = spans.sum.to_f / spans.length
    ordered = spans.sort
    mid = ordered.length / 2
    median =
      if ordered.length.odd?
        ordered[mid].to_f
      else
        (ordered[mid - 1] + ordered[mid]) / 2.0
      end

    miss_pct = miss_days.length.to_f / WINDOW_DAYS * 100
    hit_pct = 100 - miss_pct
    [average, median, hit_pct, miss_pct]
  end

  module_function def weighted_gap_rows(miss_days)
    rows = spans_from_miss_days(miss_days).tally.map {|gap, count| [gap, count, gap * count]}
    rows.sort_by {|gap, count, weighted| [-weighted, -gap, -count]}
  end

  module_function def weighted_gap_rows_with_bars(miss_days)
    rows = weighted_gap_rows(miss_days)
    max_weighted = rows.map {|row| row[2]}.max || 0
    count_num_width = [rows.map {|row| row[1].to_s.length}.max || 0, 3].max
    day_num_width = [rows.map {|row| row[0].to_s.length}.max || 0, 3].max
    weighted_num_width = [rows.map {|row| row[2].to_s.length}.max || 0, 3].max

    rows.map do |gap, count, weighted|
      bar_length =
        if weighted.zero?
          0
        else
          [(weighted.to_f / max_weighted * 24).round(half: :even), 1].max
        end

      [
        "#{count}x".ljust(count_num_width + 1),
        format("%#{day_num_width}dd between", gap),
        format("%#{weighted_num_width}d", weighted),
        '█' * bar_length
      ]
    end
  end

  module_function def build_commit_cache(file_groups)
    file_groups.values.flatten.uniq.to_h {|path| [path, git_commits(path)]}
  end

  module_function def build_miss_day_cache(commit_cache)
    commit_cache.transform_values {|commits| daily_6am_miss_days(commits)}
  end
end
