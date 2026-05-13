# frozen_string_literal: true

require 'json'
require 'pathname'

module CacheMissTestPlanSupport
  module_function def load_json_array(path)
    data = JSON.parse(path.read)
    raise "#{path} must contain a top-level JSON array" unless data.is_a?(Array)

    data
  end

  module_function def write_pretty_json(path, value)
    path.write(JSON.pretty_generate(value) + "\n")
  end

  module_function def collapse_copy_paths(rows)
    collapsed = {}

    rows.each do |row|
      copy_path = fetch_string(row, 'copy_path')
      modify_path = fetch_string(row, 'path_to_modify_to_trigger_cache_miss')
      odds = fetch_probability(row, 'odds_of_a_cache_miss')

      existing = collapsed[copy_path]
      if existing &&
          (existing.fetch('path_to_modify_to_trigger_cache_miss') != modify_path ||
          existing.fetch('odds_of_a_cache_miss') != odds)
        raise "conflicting cache miss maker rows for #{copy_path}"
      end

      collapsed[copy_path] = {
        'copy_path' => copy_path,
        'path_to_modify_to_trigger_cache_miss' => modify_path,
        'odds_of_a_cache_miss' => odds
      }
    end

    collapsed.keys.sort.map {|copy_path| collapsed.fetch(copy_path)}
  end

  module_function def load_test_plan(path)
    plan = load_json_array(path)
    plan.each do |day|
      raise "#{path} has a malformed day entry" unless day.is_a?(Hash)

      day.fetch('day')
      modify_paths = day.fetch('modify_paths')
      raise "#{path} has a malformed modify_paths entry" unless modify_paths.is_a?(Array)
    end
    plan
  end

  module_function def fetch_string(row, key)
    value = row.fetch(key)
    raise "expected #{key} to be a string" unless value.is_a?(String) && !value.empty?

    value
  end

  module_function def fetch_probability(row, key)
    raw = row.fetch(key)
    odds = Float(raw)
    raise "#{key} must be between 0.0 and 1.0" unless odds >= 0.0 && odds <= 1.0

    odds.round(6)
  end
end
