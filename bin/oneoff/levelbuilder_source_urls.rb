#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'cgi'
require 'uri'

# Toggle writes
DRY_RUN = true

def fix_start_animations
  puts DRY_RUN ? "THIS IS A DRY RUN" : "THIS IS A FULL RUN"

  total_levels       = 0
  modified_levels    = 0
  urls_updated_total = 0
  bad_json_levels    = 0
  # Map: levelbuilder URL (string) -> Set of level names that reference it
  @levelbuilder_url_to_levels = Hash.new {|h, k| h[k] = Set.new}

  puts "Processing Gamelab levels..."
  Gamelab.all.each do |level|
    next unless level.start_animations

    total_levels += 1
    begin
      animations = JSON.parse(level.start_animations)
      ordered_keys = animations['orderedKeys'] || []
      props_by_key = animations['propsByKey']  || {}

      modified_this_level = false

      ordered_keys.each do |key|
        props = props_by_key[key]
        next unless props.is_a?(Hash) && props['sourceUrl'].is_a?(String)

        original_url = props['sourceUrl']
        new_url = normalize_source_url(original_url, level.name)

        # Only write back if we actually changed the URL string
        if new_url && new_url != original_url
          props['sourceUrl'] = new_url
          urls_updated_total += 1
          modified_this_level = true
          # puts "✔ Rewriting on #{level.name}\n  #{new_url}"
        end
      end

      if modified_this_level
        animations['propsByKey'] = props_by_key
        level.start_animations = JSON.pretty_generate(animations)
        level.save!(touch: false) unless DRY_RUN
        modified_levels += 1
      end
    rescue
      puts "Failed to process #{level.name} due to bad JSON"
      bad_json_levels += 1
    end
  end

  if @levelbuilder_url_to_levels.any?
    puts "\n--- LEVELBUILDER URLS REQUIRING MANUAL REVIEW ---"
    @levelbuilder_url_to_levels.each do |url, level_names|
      puts url
      level_names.sort.each {|name| puts name}
      puts
    end
  end

  puts "\n--- SUMMARY ---"
  puts "Levels processed:  #{total_levels}"
  puts "Levels modified:   #{modified_levels}"
  puts "URLs updated:      #{urls_updated_total}"
  puts "Bad JSON levels:   #{bad_json_levels}"
  puts "Levelbuilder URLs: #{@levelbuilder_url_to_levels.size}"
  puts DRY_RUN ? "NO CHANGES WERE SAVED" : "CHANGES WERE SAVED"
end

# Returns a possibly-updated URL string, or nil if no change should be made.
def normalize_source_url(url, level_name)
  # 1) Recursively unwrap proxies from any domain: .../media?u=<encoded_url>
  unwrapped = unwrap_proxied_url_recursive(url)
  uri = safe_uri_parse(unwrapped)
  return nil unless uri

  unwrapped_changed = (unwrapped != url)

  # 2) If it's in the animationlibrary, make it relative
  if uri.path&.start_with?('/api/v1/animation-library')
    return uri.path
  end

  # 3) Warn if the animation only exists on levelbuilder-studio.code.org
  if uri.host == 'levelbuilder-studio.code.org'
    # puts "⚠ Levelbuilder URL in (#{level_name})\n  #{unwrapped}"
    @levelbuilder_url_to_levels[unwrapped] << level_name
  end

  # Only update if unwrapping changed something
  unwrapped_changed ? unwrapped : nil
end

def unwrap_proxied_url_recursive(url)
  max_depth = 10
  current = url
  max_depth.times do
    next_url = unwrap_proxied_url_once(current)
    break if next_url == current
    current = next_url
  end
  current
end

def unwrap_proxied_url_once(url)
  uri = safe_uri_parse(url)
  return url unless uri
  return url unless uri.path == '/media'

  params = CGI.parse(uri.query || '')
  u = params['u']&.first
  return url if u.nil? || u.empty?

  CGI.unescape(u)
rescue
  url
end

def safe_uri_parse(url)
  URI.parse(url)
rescue
  nil
end

fix_start_animations
