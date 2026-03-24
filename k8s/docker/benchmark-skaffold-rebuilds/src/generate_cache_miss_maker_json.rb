#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'pathname'

module GenerateCacheMissMakerJson
  SCRIPT_DIR = Pathname(__dir__).realpath
  DOCKER_DIR = SCRIPT_DIR.parent.parent
  REPO_ROOT = DOCKER_DIR.parent.parent
  JSON_FILENAME = 'daily-odds-of-file-change.json'

  module_function def dockerignore_path(dockerfile_name)
    DOCKER_DIR / "#{dockerfile_name}.dockerignore"
  end

  module_function def dockerignore_rules(dockerfile_name)
    path = dockerignore_path(dockerfile_name)
    return [] unless path.exist?

    path.each_line.filter_map do |raw_line|
      line = raw_line.strip
      next if line.empty? || line.start_with?('#')

      line
    end
  end

  module_function def pattern_matches?(path, pattern)
    normalized_path = path.sub(%r{\A/+}, '')
    normalized_pattern = pattern.sub(%r{\A/+}, '')

    directory_pattern = normalized_pattern.end_with?('/')
    normalized_pattern = normalized_pattern.delete_suffix('/') if directory_pattern
    return false if normalized_pattern.empty?

    has_glob = normalized_pattern.match?(/[*?\[]/)
    if has_glob
      return true if File.fnmatch?(normalized_pattern, normalized_path, File::FNM_PATHNAME)

      if directory_pattern
        parts = normalized_path.split('/')
        1.upto(parts.length - 1) do |index|
          parent = parts[0...index].join('/')
          return true if File.fnmatch?(normalized_pattern, parent, File::FNM_PATHNAME)
        end
      end
      return false
    end

    normalized_path == normalized_pattern || normalized_path.start_with?("#{normalized_pattern}/")
  end

  module_function def dockerignored?(dockerfile_name, path)
    ignored = false
    dockerignore_rules(dockerfile_name).each do |raw_rule|
      negated = raw_rule.start_with?('!')
      rule = negated ? raw_rule[1..] : raw_rule
      ignored = !negated if pattern_matches?(path, rule)
    end
    ignored
  end

  module_function def imaginary_cache_miss_path(copy_path, dockerfile_name)
    candidate_names = [
      'change-me-to-trigger-dockerfile-copy-cache-miss.txt',
      'change-me-to-trigger-dockerfile-copy-cache-miss.md',
      'change-me-to-trigger-dockerfile-copy-cache-miss/probe.txt'
    ]

    candidate_names.each do |candidate_name|
      candidate = (Pathname(copy_path) / candidate_name).to_s
      next if dockerignored?(dockerfile_name, candidate)
      next if (REPO_ROOT / candidate).exist?

      return candidate
    end

    raise "unable to find non-ignored imaginary file path inside #{copy_path} for #{dockerfile_name}"
  end

  module_function def copy_path_owners(copy_path_dependencies)
    owners = {}
    copy_path_dependencies.each do |dockerfile, paths|
      next if dockerfile == 'code-dot-org.dockerfile'

      paths.each do |path|
        existing = owners[path]
        raise "#{path} is declared by both #{existing} and #{dockerfile}" if existing && existing != dockerfile

        owners[path] = dockerfile
      end
    end
    owners
  end

  module_function def main_dockerfile_row(file_groups, miss_day_cache, window_days)
    dockerfile = 'code-dot-org.dockerfile'
    miss_days = file_groups.fetch(dockerfile).flat_map {|path| miss_day_cache.fetch(path)}.uniq.sort

    {
      'dockerfile' => dockerfile,
      'copy_path' => '.',
      'path_to_modify_to_trigger_cache_miss' =>
        imaginary_cache_miss_path('.', dockerfile),
      'odds_of_a_cache_miss' => (miss_days.length.to_f / window_days).round(6)
    }
  end

  module_function def write_cache_miss_maker_json(output_dir, file_groups, copy_path_dependencies, miss_day_cache, window_days)
    json_path = output_dir / JSON_FILENAME
    path_owners = copy_path_owners(copy_path_dependencies)
    rows = [main_dockerfile_row(file_groups, miss_day_cache, window_days)]

    file_groups.each do |dockerfile, paths|
      next if dockerfile == 'code-dot-org.dockerfile'

      paths.each do |copy_path|
        owner = path_owners.fetch(copy_path)
        rows << {
          'dockerfile' => dockerfile,
          'copy_path' => copy_path,
          'path_to_modify_to_trigger_cache_miss' => imaginary_cache_miss_path(copy_path, owner),
          'odds_of_a_cache_miss' => (miss_day_cache.fetch(copy_path).length.to_f / window_days).round(6)
        }
      end
    end

    json_path.write(JSON.pretty_generate(rows) + "\n")
    json_path
  end
end
