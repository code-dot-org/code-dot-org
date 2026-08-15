#!/usr/bin/env ruby
# bin/oneoff/hoai_2025/restore_heads_from_s3.rb
#
# Safely restore local sprites from S3. No generation, no uploads.
# Defaults to DRY RUN. Pass --no-dry-run to actually write.
#
# Requires: aws-sdk-s3, ruby-progressbar, parallel

require 'aws-sdk-s3'
require 'ruby-progressbar'
require 'optparse'
require 'parallel'
require 'fileutils'
require 'etc'

# ---- Config you probably won't change often ----
BUCKET_NAME_BASE = 'cdo-curriculum'.freeze
BUCKET_PATH      = 'media/musiclab/generate/dancer/'.freeze
SUBDIR_NAME      = 'creature-attire-mood-05'.freeze

# ---- CLI ----
options = {
  production: false,
  dry_run: true,
  prefix: nil,
  dest: nil,
  threads: Etc.nprocessors,
  verbose: false
}

parser = OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage:
      ruby #{File.basename(__FILE__)} [options]

    Restores local directory:
      python/hoai_2025/output/#{SUBDIR_NAME}
    from S3 prefix:
      s3://(cdo-curriculum[-devel])/#{BUCKET_PATH}#{SUBDIR_NAME}/

    By default this is a DRY RUN (no changes). Add --no-dry-run to actually write.

    Options:
  BANNER

  opts.on('--production', 'Use production bucket (cdo-curriculum) instead of -devel') {options[:production] = true}
  opts.on('--[no-]dry-run', 'If false, delete & write files locally (default: true)') {|v| options[:dry_run] = v}
  opts.on('--prefix PREFIX', 'Override S3 prefix (default derives from BUCKET_PATH + subdir)') {|v| options[:prefix] = v}
  opts.on('--dest PATH', 'Override local destination directory (default is repo/python/hoai_2025/output/...)') {|v| options[:dest] = v}
  opts.on('--threads N', Integer, 'Parallel download threads (default: CPU cores)') {|v| options[:threads] = v}
  opts.on('--verbose', 'Print some per-file info') {options[:verbose] = true}
  opts.on('-h', '--help', 'Show help') {puts opts; exit 0}
end

begin
  parser.parse!
rescue OptionParser::ParseError => exception
  warn exception.message
  puts parser
  exit 2
end

# Resolve bucket & paths
bucket_name = "#{BUCKET_NAME_BASE}#{options[:production] ? '' : '-devel'}"

script_dir = __dir__
repo_root  = File.expand_path(File.join(script_dir, '..', '..', '..'))
default_dest = File.join(repo_root, 'python', 'hoai_2025', 'output', SUBDIR_NAME)
dest_dir = File.expand_path(options[:dest] || default_dest)

default_prefix = File.join(BUCKET_PATH, "#{SUBDIR_NAME}/") # ensure trailing slash
prefix = options[:prefix] ? options[:prefix].dup : default_prefix
prefix << '/' unless prefix.end_with?('/')

puts "Restore FROM: s3://#{bucket_name}/#{prefix}"
puts "Restore   TO: #{dest_dir}"
puts "Threads: #{options[:threads]} | Mode: #{options[:dry_run] ? 'DRY RUN' : 'WRITE'}"
puts

# List keys
s3 = Aws::S3::Client.new
keys = []
token = nil

begin
  loop do
    resp = s3.list_objects_v2(bucket: bucket_name, prefix: prefix, continuation_token: token)
    (resp.contents || []).each {|obj| keys << obj.key unless obj.key.end_with?('/')}
    token = resp.next_continuation_token
    break unless token
  end
rescue Aws::S3::Errors::ServiceError => exception
  warn "Error listing S3 objects: #{exception.message}"
  exit 1
end

if keys.empty?
  puts "No objects found under s3://#{bucket_name}/#{prefix}"
  exit 0
end

puts "Found #{keys.size} object(s)."

# Delete local dir (unless dry-run)
if options[:dry_run]
  puts "[DRY RUN] Would remove: #{dest_dir}"
else
  begin
    FileUtils.rm_rf(dest_dir)
    FileUtils.mkdir_p(dest_dir)
  rescue => exception
    warn "Failed to reset destination dir: #{exception.message}"
    exit 1
  end
end

# Download
bar = ProgressBar.create(total: keys.size, format: "%e %B %p%% %c/%C")
Parallel.map(keys,
             in_threads: [1, options[:threads].to_i].max,
             finish: ->(_, _, _) {bar&.increment}
) do |key|
  rel = key.sub(/^#{Regexp.escape(prefix)}/, '')
  dest = File.join(dest_dir, rel)

  if options[:dry_run]
    if options[:verbose] && rand < 0.01
      puts "[DRY RUN] Would write: #{dest}"
    end
    next true
  end

  begin
    FileUtils.mkdir_p(File.dirname(dest))
    # stream to file to avoid loading whole object in memory
    s3.get_object(bucket: bucket_name, key: key) do |chunk|
      File.open(dest, 'ab') {|f| f.write(chunk)}
    end
    true
  rescue Aws::S3::Errors::NoSuchKey
    warn "Missing on S3: #{key}"
    false
  rescue => exception
    warn "Error downloading #{key}: #{exception.message}"
    false

    # ensure we don't accidentally append to the same file twice if retried
    # (not usually needed, but left here as a reminder)
  end
end
bar&.finish

puts
if options[:dry_run]
  puts "Done (dry run). Local files unchanged."
else
  puts "Done. Local directory now mirrors s3://#{bucket_name}/#{prefix}"
end
