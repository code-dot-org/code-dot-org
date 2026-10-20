#!/usr/bin/env ruby

# App Lab loads absolute image URLs directly in the student's browser (#74146),
# so school filters that block a third-party host break the image.  This copies
# images from hosts outside ALLOWED_IMAGE_HOSTNAME_SUFFIXES to images.code.org
# and rewrites the App Lab .level files to point there.
#
# It edits the files in dashboard/config/levels, not the database, so the diff
# holds only URL changes and does not depend on the local database being seeded.
# Run from the repo root:
#
#   bin/oneoff/rehost_applab_images.rb                       # dry run, all levels
#   LEVEL_NAME='U3 Program ...' bin/oneoff/rehost_applab_images.rb
#   DRY_RUN=false bin/oneoff/rehost_applab_images.rb         # upload and write
#
# A dry run downloads each image to check it but uploads and writes nothing.
# Uploads are recorded in MAP_FILE, so a rerun reuses them instead of
# uploading again.  REPORT_FILE gets one CSV row per URL and level, and
# SKIPPED_FILE the rows for URLs that could not be rehosted.

require_relative '../../dashboard/config/environment'
require 'cgi'
require 'csv'
require 'json'
require 'net/http'
require 'uri'

DRY_RUN = ENV['DRY_RUN'] != 'false'
LEVEL_NAME = ENV['LEVEL_NAME'].presence
MAP_FILE = ENV['MAP_FILE'].presence || Rails.root.join('tmp', 'applab_image_rehost_map.json').to_s
REPORT_FILE = ENV['REPORT_FILE'].presence || Rails.root.join('tmp', 'applab_image_rehost_report.csv').to_s
# Only the URLs that could not be rehosted, for curriculum to replace by hand.
SKIPPED_FILE = ENV['SKIPPED_FILE'].presence || Rails.root.join('tmp', 'applab_image_rehost_skipped.csv').to_s
LEVELS_GLOB = Rails.root.join('config', 'levels', '**', '*.level').to_s
# Already fixed by hand on levelbuilder; rewriting them here would conflict with
# the robo-commit that carries that fix.
SKIP_LEVELS = [
  'U3 Program Investigate Event-Driven 3_2025',
  'U4 L06 Lemon Hunter App v1 Code_2025',
].freeze

BUCKET = 'images.code.org'.freeze
ALLOWED_SUFFIXES = (SharedConstants::ALLOWED_IMAGE_HOSTNAME_SUFFIXES + %w(code.org)).freeze
MAX_BYTES = 10.megabytes
MAX_REDIRECTS = 5

CONFIG_REGEX = /<config><!\[CDATA\[(.*)\]\]><\/config>/m
AUDIT_LOG_LINE_REGEX = /^  "audit_log": (".*")$/
CONFIG_END_REGEX = /\n\}\]\]><\/config>/
FIELDS = %w(start_html start_blocks).freeze
# Level#log_changes keeps the log under the size of its column.
MAX_AUDIT_LOG_LENGTH = 65_535
CHANGED_BY_EMAIL = ENV['CHANGED_BY_EMAIL'].presence || `git config user.email`.strip.presence
AUDIT_NOTE = 'images rehosted to images.code.org by bin/oneoff/rehost_applab_images.rb'.freeze

# //any.host/media?u=<percent-encoded url>, as written by assetPrefix.fixPath.
PROXIED_URL_REGEX = %r{(?:https?:)?//[A-Za-z0-9.-]+/media\?u=([^"'&\s()<>\\]+)}
# An absolute URL, stopping before an HTML-escaped quote as in url(&quot;...&quot;).
# Backslash ends a URL so that a match never runs past a JSON-escaped quote.
ABSOLUTE_URL_REGEX = %r{https?://[^\s"'()<>\\]+?(?=&quot;|["'()\s<>\\]|\z)}
CANONICAL_ATTRIBUTE_REGEX = /data-canonical-image-url="([^"]+)"/
IMAGE_PATH_REGEX = /\.(png|jpe?g|gif|svg|bmp|webp)\z/i

def unwrap_proxied(encoded)
  url = CGI.unescape(encoded)
  10.times do
    match = url.match(/\A#{PROXIED_URL_REGEX}\z/o)
    break unless match
    url = CGI.unescape(match[1])
  end
  url
end

def disallowed_host?(url)
  host = URI.parse(url).host&.downcase
  return false unless host
  ALLOWED_SUFFIXES.none? {|suffix| host == suffix || host.end_with?(".#{suffix}")}
rescue URI::InvalidURIError
  false
end

# Image URLs in the field: proxied URLs, App Lab's canonical image attribute, and
# URLs ending in an image extension.  Other URLs (lesson links, the fake phishing
# domains in cybersecurity levels) are never fetched.  start_html is HTML, so its
# attribute values are entity-escaped.
def image_urls(text, html:)
  urls = text.scan(PROXIED_URL_REGEX).map {|(encoded)| unwrap_proxied(encoded)}
  if html
    urls += text.scan(CANONICAL_ATTRIBUTE_REGEX).map {|(value)| CGI.unescapeHTML(value)}
  end
  text.gsub(PROXIED_URL_REGEX, '').scan(ABSOLUTE_URL_REGEX) do
    url = html ? CGI.unescapeHTML(Regexp.last_match[0]) : Regexp.last_match[0]
    urls << url if IMAGE_PATH_REGEX.match?(URI.parse(url).path.to_s)
  rescue URI::InvalidURIError
    next
  end
  urls.grep(%r{\Ahttps?://}i)
end

# Rewrites the raw file text, where start_html and start_blocks are JSON strings.
# The replacement URLs contain no character that JSON or HTML would escape.
def rewrite(text, mapping)
  text = text.gsub(PROXIED_URL_REGEX) do |match|
    mapping[unwrap_proxied(Regexp.last_match(1))] || match
  end
  text.gsub(ABSOLUTE_URL_REGEX) do |match|
    mapping[match] || mapping[CGI.unescapeHTML(match)] || match
  end
end

# Appends an entry in Level#log_changes' shape, so the level editor's Audit Log
# shows it.  Raises unless the existing log re-encodes to the same bytes, so a
# file is never rewritten with a different escaping of its old log.
def append_audit_log(text, changed_fields)
  line = text[AUDIT_LOG_LINE_REGEX, 1]
  log = line ? JSON.parse(JSON.parse(line)) : []
  raise 'audit_log does not round-trip' if line && JSON.generate(JSON.parse(line)) != line

  entry = {changed_at: Time.now.utc.strftime('%Y-%m-%d %H:%M:%S +0000'), changed: changed_fields, note: AUDIT_NOTE}
  entry[:changed_by_email] = CHANGED_BY_EMAIL if CHANGED_BY_EMAIL
  log.push(entry)
  log.shift while JSON.dump(log).length >= MAX_AUDIT_LOG_LENGTH
  literal = JSON.generate(JSON.dump(log))

  if line
    text.sub(AUDIT_LOG_LINE_REGEX) {"  \"audit_log\": #{literal}"}
  else
    text.sub(CONFIG_END_REGEX) {",\n  \"audit_log\": #{literal}\n}]]></config>"}
  end
end

def fetch(url, redirects = MAX_REDIRECTS)
  uri = URI.parse(url)
  response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 10, read_timeout: 20) do |http|
    http.get(uri.request_uri, 'User-Agent' => 'Mozilla/5.0 (code.org image rehost)')
  end
  if response.is_a?(Net::HTTPRedirection) && redirects > 0
    return fetch(URI.join(url, response['location']).to_s, redirects - 1)
  end
  raise "HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

  content_type = response['content-type'].to_s.split(';').first.to_s.strip.downcase
  raise "not an image (#{content_type.presence || 'no content type'})" unless content_type.start_with?('image/')
  raise "too large (#{response.body.bytesize} bytes)" if response.body.bytesize > MAX_BYTES

  [response.body, content_type]
end

def upload_filename(url, content_type)
  name = File.basename(URI.parse(url).path.to_s).gsub(/[^A-Za-z0-9._-]/, '_')
  name = 'image' if name.blank? || name.start_with?('.')
  if File.extname(name).empty?
    extension = Rack::Mime::MIME_TYPES.invert[content_type]
    name += extension if extension
  end
  name
end

# Unit names from the local database, for the report only.
def unit_names(level_name)
  level = Level.find_by(name: level_name)
  return '' unless level
  level.script_levels.filter_map {|sl| sl.script&.name}.uniq.sort.join(' ')
rescue StandardError
  ''
end

def main
  puts DRY_RUN ? 'DRY RUN: nothing will be uploaded or written' : 'FULL RUN: uploading and writing files'

  uploaded = File.exist?(MAP_FILE) ? JSON.parse(File.read(MAP_FILE)) : {}
  results = {}
  rows = []
  files_changed = 0
  files_failed = 0

  paths = Dir.glob(LEVELS_GLOB).sort
  paths.select! {|path| File.basename(path, '.level') == LEVEL_NAME} if LEVEL_NAME
  paths.reject! {|path| SKIP_LEVELS.include?(File.basename(path, '.level'))}
  abort "No level file named #{LEVEL_NAME.inspect}, or it is in SKIP_LEVELS" if LEVEL_NAME && paths.empty?

  paths.each do |path|
    text = File.read(path)
    next unless text.start_with?('<Applab>')
    level_name = File.basename(path, '.level')

    properties = JSON.parse(text[CONFIG_REGEX, 1])['properties'] || {}
    urls = Set.new
    FIELDS.each do |field|
      value = properties[field]
      next unless value.is_a?(String)
      image_urls(value, html: field == 'start_html').each do |url|
        urls << url if disallowed_host?(url)
      end
    end
    next if urls.empty?

    units = unit_names(level_name)
    mapping = {}
    urls.each do |url|
      results[url] ||=
        if uploaded[url]
          {status: 'already uploaded', new_url: uploaded[url]}
        else
          begin
            data, content_type = fetch(url)
            if DRY_RUN
              {status: 'would upload', new_url: "https://#{BUCKET}/DRY-RUN-#{upload_filename(url, content_type)}", bytes: data.bytesize}
            else
              key = AWS::S3.upload_to_bucket(BUCKET, upload_filename(url, content_type), data, acl: 'public-read', content_type: content_type)
              uploaded[url] = "https://#{BUCKET}/#{key}"
              File.write(MAP_FILE, JSON.pretty_generate(uploaded))
              {status: 'uploaded', new_url: uploaded[url], bytes: data.bytesize}
            end
          rescue StandardError => exception
            {status: 'skipped', error: exception.message}
          end
        end

      result = results[url]
      mapping[url] = result[:new_url] if result[:new_url]
      rows << [level_name, units, url, result[:status], result[:new_url], result[:error]]
    end
    next if mapping.empty?

    new_text = rewrite(text, mapping)
    next if new_text == text

    # The rewritten config must still parse, and no rehosted URL may remain in it.
    new_properties = JSON.parse(new_text[CONFIG_REGEX, 1])['properties'] || {}
    changed_fields = (properties.keys | new_properties.keys).reject {|key| properties[key] == new_properties[key]}
    new_text = append_audit_log(new_text, changed_fields)
    JSON.parse(new_text[CONFIG_REGEX, 1])
    leftover = FIELDS.flat_map do |field|
      value = new_properties[field]
      value.is_a?(String) ? image_urls(value, html: field == 'start_html') & mapping.keys : []
    end
    if leftover.any?
      files_failed += 1
      puts "FAILED to rewrite #{level_name}: #{leftover.uniq.join(', ')} still present"
      next
    end

    File.write(path, new_text) unless DRY_RUN
    files_changed += 1
    puts "#{DRY_RUN ? 'Would update' : 'Updated'}: #{level_name}"
  rescue StandardError => exception
    files_failed += 1
    puts "FAILED on #{path}: #{exception.message[0, 200]}"
  end

  CSV.open(REPORT_FILE, 'w') do |csv|
    csv << %w(level units original_url status new_url error)
    rows.each {|row| csv << row}
  end
  CSV.open(SKIPPED_FILE, 'w') do |csv|
    csv << %w(original_url error level units)
    rows.select {|row| row[3] == 'skipped'}.sort_by {|row| [row[2], row[0]]}.each do |level_name, units, url, _, _, error|
      csv << [url, error, level_name, units]
    end
  end

  counts = results.values.group_by {|r| r[:status]}.transform_values(&:size)
  puts "\n--- SKIPPED URLS (dead, not images, or too large) ---"
  levels_by_url = rows.group_by {|row| row[2]}
  results.each do |url, result|
    next unless result[:status] == 'skipped'
    puts "#{url}\n  #{result[:error]}"
    levels_by_url[url].each do |level_name, units|
      puts "    #{level_name}#{" (#{units})" if units.present?}"
    end
  end
  puts "\n--- SUMMARY ---"
  puts "Distinct URLs: #{results.size}"
  counts.sort.each {|status, count| puts "  #{status}: #{count}"}
  puts "Files #{DRY_RUN ? 'to update' : 'updated'}: #{files_changed}"
  puts "Files failed: #{files_failed}"
  puts "Report: #{REPORT_FILE}"
  puts "Skipped: #{SKIPPED_FILE}"
  puts "Upload map: #{MAP_FILE}" unless DRY_RUN
  puts DRY_RUN ? 'NO CHANGES WERE WRITTEN' : 'CHANGES WERE WRITTEN'
end

main
