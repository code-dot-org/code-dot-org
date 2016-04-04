# This class downloads milestone logs from our S3 bucket, counts the lines of code documented
# in the logs, and stores the total lines (per log) in
# pegasus/cache/milestone-cache.json.
#
# Logs for days that are over are .gz compressed in S3. The log for the current day is not
# compressed and updates are uploaded hourly. See upload-logs-to-s3 for details on the upload
# side.

require 'cdo/aws/s3'
require 'active_support/core_ext/class/attribute_accessors'
require 'digest'
require 'parallel'
require 'fileutils'

class MilestoneParser
  # Ignore milestone logs in these host paths
  IGNORE_HOSTS = %w(console daemon production-daemon staging test levelbuilder-staging levelbuilder-development development react adhoc)

  MILESTONE_CACHE = pegasus_dir('cache', 'milestone-cache.json')
  MILESTONE_CACHE_V2 = pegasus_dir('cache', 'milestone-cache_v2.json')
  # Number of bytes to compare to test for rotated log
  COMPARE_BYTE_LENGTH = 1024

  attr_accessor :cache, :s3_client, :s3_resource
  cattr_accessor :log_debug

  def debug(msg)
    puts msg if self.log_debug
  end

  def self.count
    # Load v2 cache
    cache_file = MILESTONE_CACHE_V2
    FileUtils.cp(MILESTONE_CACHE, cache_file) unless File.file?(cache_file)
    cache = File.file?(cache_file) ? JSON.parse(IO.read(cache_file)) : {}
    parser = self.new(cache, AWS::S3::create_client)
    parser.count.tap{|_|IO.write MILESTONE_CACHE_V2, JSON.pretty_generate(parser.cache)}
  end

  def initialize(cache, s3_client)
    @cache = cache
    @s3_client = s3_client
    @s3_resource = Aws::S3::Resource.new(client: s3_client)
    self.log_debug = true
  end

  # Parses all milestone logs in s3://cdo-logs/hosts/**/dashboard/milestone.log*
  # Return total lines of code count
  def count
    start_time = Time.now
    debug 'Fetching milestone logs..'

    hosts = s3_client.list_objects(bucket: 'cdo-logs', prefix: 'hosts/', delimiter: '/').data.common_prefixes.map(&:prefix)
    hosts.select! do |prefix|
      match = prefix.match /^hosts\/(?<host>[^\/]+)\//
      match && !(IGNORE_HOSTS.include? match[:host])
    end
    logs = Parallel.map(hosts, in_threads: 16) do |host|
      s3_resource.bucket('cdo-logs').objects(prefix: "#{host}dashboard/milestone.log")
    end.map(&:to_a).flatten
    debug "Found #{logs.length} logs.."
    counts = logs.map do |log|
      (cache[log.key] = count_lines_of_code(log))['count']
    end
    total = counts.reduce(:+)
    debug "Finished processing (#{(Time.now - start_time).round(2)}s), total count: #{total}"
    total
  end

  def count_lines_of_code(log)
    length = fetch_bytes = log.size
    return {'count' => 0} if length == 0
    key = log.key
    filename = File.basename(key)
    ext = File.extname(filename)
    raise ArgumentError, "Don't know how to process #{ext} files." unless %w(.log .gz).include? ext
    path = pegasus_dir 'cache', filename

    # Remove surrounding quotation marks from etag string
    etag = log.etag.gsub(/\A"|"\Z/, '')
    partial_count = 0
    md5 = nil
    fetch_params = {response_target: path}

    if (cached = cache[key]).is_a?(Hash)
      return cached if etag == cached['etag']
      if cached['md5']
        compare_bytes = [COMPARE_BYTE_LENGTH, length, cached['length']].min
        debug "#{key} modified, comparing starting #{compare_bytes} bytes.."
        check_value = log.get(range: "bytes=0-#{compare_bytes - 1}").body.read
        md5 = Digest::MD5.hexdigest(check_value)
        if cached['md5'] == md5
          partial_count = cached['count']
          cached_length = cached['length']
          fetch_bytes = (length - cached_length)
          fetch_params[:range] = "bytes=#{cached_length}-"
          debug "Starting content match, downloading remaining #{fetch_bytes} bytes.."
        end
      end
    else
      # Assume cached .gz files without etag haven't been modified
      return {'count' => cached, 'etag' => etag} if ext == '.gz' && cached.is_a?(Numeric)
    end

    debug "Downloading #{key}, #{fetch_bytes} bytes.."
    log.get fetch_params
    stub_fetch(key, path, fetch_bytes)
    debug "Processing #{key}.."
    # Sum up all values in the 10th tab-delimited column
    count = partial_count + `#{ext == '.gz' ? 'gunzip -c' : 'cat'} #{path} | cut -f10 | awk '{s+=$1} END {print s}'`.to_i
    response = {'count' => count, 'etag' => etag}
    unless ext == '.gz'
      md5 ||= Digest::MD5.hexdigest `cat #{path} | head -c #{COMPARE_BYTE_LENGTH}`
      response['length'] = length
      response['md5'] = md5
    end
    FileUtils.rm path
    debug "Count: #{count}"
    response
  end

  def stub_fetch(key, path, bytes); end
end
