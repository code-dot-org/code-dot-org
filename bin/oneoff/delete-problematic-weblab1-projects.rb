#!/usr/bin/env ruby

# Usage:
#   Dry run from the beginning:
#     bundle exec ruby bin/oneoff/delete-problematic-weblab1-projects.rb
#   Dry run starting after a known project id:
#     bundle exec ruby bin/oneoff/delete-problematic-weblab1-projects.rb --start-id 12345
#   Live run:
#     bundle exec ruby bin/oneoff/delete-problematic-weblab1-projects.rb --delete
#
# This scans legacy Web Lab 1 projects in ascending projects.id order, fetches
# each project's HTML files from S3, and checks them with FilesApi#valid_html_content?.
# If any HTML file would now be refused on save, the script soft-deletes the
# whole project.
#
# Why this exists:
# New server-side validation stops future saves of HTML with disallowed content
# such as inline event handler attributes (on*). That does not clean up the old
# backlog already stored in S3 and still shareable on codeprojects. This oneoff
# finds those existing projects and removes them by soft-deleting the project
# row, instead of mutating individual files in place.
#
# State files:
#   Dry run: ~/dryrun-delete-problematic-weblab1-projects/
#   Live run: ~/delete-problematic-weblab1-projects/
# Each run directory contains lastid.txt and bad-html-links.txt. Live runs also
# append deleted project ids to deleted.txt.

require 'optparse'
require 'thread'
require 'erb'
require 'fileutils'

require_relative '../../dashboard/config/environment'

require CDO.dir('shared', 'middleware', 'helpers', 'storage_id.rb') unless defined?(get_project_channel_id)
require CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', 'bucket_helper.rb') unless defined?(BucketHelper)
require CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', 'file_bucket.rb') unless defined?(FileBucket)
require CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', 'projects.rb') unless defined?(Projects)
require CDO.dir('dashboard', 'legacy', 'middleware', 'files_api.rb') unless defined?(FilesApi)

class DeleteProblematicWeblab1Projects
  DEFAULT_BATCH_SIZE = 100
  DEFAULT_WORKER_COUNT = 10
  DEFAULT_CHECKPOINT_EVERY_BATCHES = 10

  STOP = Object.new.freeze

  ProjectScanResult = Struct.new(
    :project_id,
    :storage_id,
    :state,
    :channel_id,
    :status,
    :offending_filenames,
    :error_message,
    keyword_init: true
  )

  def self.default_run_directory(delete:)
    File.join(
      Dir.home,
      delete ? 'delete-problematic-weblab1-projects' : 'dryrun-delete-problematic-weblab1-projects'
    )
  end

  def self.default_checkpoint_path(delete:)
    File.join(default_run_directory(delete:), 'lastid.txt')
  end

  def self.default_deleted_ids_path(delete:)
    File.join(default_run_directory(delete:), 'deleted.txt')
  end

  def self.default_bad_html_links_path(delete:)
    File.join(default_run_directory(delete:), 'bad-html-links.txt')
  end

  def self.resolve_start_id(start_id:, checkpoint_path:)
    return start_id unless start_id.nil?
    return 0 unless File.exist?(checkpoint_path)

    Integer(File.read(checkpoint_path).strip)
  end

  def self.parse_options(argv)
    options = {
      start_id: nil,
      batch_size: DEFAULT_BATCH_SIZE,
      worker_count: DEFAULT_WORKER_COUNT,
      checkpoint_every_batches: DEFAULT_CHECKPOINT_EVERY_BATCHES,
      delete: false,
    }

    OptionParser.new do |opts|
      opts.banner = <<~BANNER
        Usage: #{File.basename(__FILE__)} [options]

        Scan Web Lab 1 projects and soft-delete projects whose HTML files would
        fail FilesApi#valid_html_content?.
      BANNER

      opts.on('--start-id ID', Integer, 'Start scanning after this project id') do |start_id|
        options[:start_id] = start_id
      end

      opts.on('--batch-size N', Integer, 'Projects to scan per batch (default: 100)') do |batch_size|
        options[:batch_size] = batch_size
      end

      opts.on('--worker-count N', Integer, 'Concurrent project workers per batch (default: 10)') do |worker_count|
        options[:worker_count] = worker_count
      end

      opts.on('--checkpoint-every-batches N', Integer, 'Write checkpoint every N batches (default: 10)') do |value|
        options[:checkpoint_every_batches] = value
      end

      opts.on('--delete', 'Soft-delete invalid projects instead of dry-run logging') do
        options[:delete] = true
      end

      opts.on('-h', '--help', 'Print this help message') do
        puts opts
        exit
      end
    end.parse!(argv)

    %i[batch_size worker_count checkpoint_every_batches].each do |key|
      raise OptionParser::InvalidArgument, "#{key} must be > 0" unless options[key].to_i > 0
    end
    raise OptionParser::InvalidArgument, 'start_id must be >= 0' unless options[:start_id].nil? || options[:start_id] >= 0

    options
  end

  def initialize(
    start_id:,
    batch_size: DEFAULT_BATCH_SIZE,
    worker_count: DEFAULT_WORKER_COUNT,
    checkpoint_every_batches: DEFAULT_CHECKPOINT_EVERY_BATCHES,
    delete: false,
    checkpoint_path: self.class.default_checkpoint_path(delete:),
    deleted_ids_path: self.class.default_deleted_ids_path(delete:),
    bad_html_links_path: self.class.default_bad_html_links_path(delete:),
    logger: $stdout,
    project_batch_loader: nil,
    channel_id_resolver: method(:get_project_channel_id),
    file_bucket_factory: -> {FileBucket.new},
    html_validator: FilesApi.allocate.method(:valid_html_content?),
    project_deleter_factory: ->(storage_id) {Projects.new(storage_id)}
  )
    @start_id = start_id
    @batch_size = batch_size
    @worker_count = worker_count
    @checkpoint_every_batches = checkpoint_every_batches
    @delete = delete
    @checkpoint_path = checkpoint_path
    @deleted_ids_path = deleted_ids_path
    @bad_html_links_path = bad_html_links_path
    @logger = logger
    @project_batch_loader = project_batch_loader
    @channel_id_resolver = channel_id_resolver
    @file_bucket_factory = file_bucket_factory
    @html_validator = html_validator
    @project_deleter_factory = project_deleter_factory
    @deleted_ids_mutex = Mutex.new
    @deleted_ids_file = nil
    @bad_html_links_mutex = Mutex.new
    @bad_html_links_file = nil
  end

  def run
    last_completed_id = @start_id
    batch_number = 0

    log "starting start_id=#{@start_id} batch_size=#{@batch_size} worker_count=#{@worker_count} " \
      "checkpoint_every_batches=#{@checkpoint_every_batches} delete=#{@delete}"

    loop do
      rows = load_batch(last_completed_id)
      break if rows.empty?

      batch_number += 1
      log "batch_start number=#{batch_number} start_after_id=#{last_completed_id} size=#{rows.length}"

      results = process_batch(rows)
      last_completed_id = rows.last[:id]

      log_batch_end(batch_number, last_completed_id, results)

      write_checkpoint(last_completed_id) if (batch_number % @checkpoint_every_batches).zero?
    end

    write_checkpoint(last_completed_id)
    log "finished last_completed_id=#{last_completed_id}"
  ensure
    @deleted_ids_file&.close
    @bad_html_links_file&.close
  end

  private def load_batch(after_id)
    return @project_batch_loader.call(after_id, @batch_size) if @project_batch_loader

    Projects.table.
      where(project_type: 'weblab').
      where(Sequel[:id] > after_id).
      order(:id).
      limit(@batch_size).
      select(:id, :storage_id, :state).
      all
  end

  private def process_batch(rows)
    queue = Queue.new
    rows.each {|row| queue << row}

    thread_count = [@worker_count, rows.length].min
    thread_count.times {queue << STOP}

    results = Queue.new

    threads = Array.new(thread_count) do
      Thread.new do
        loop do
          row = queue.pop
          break if row.equal?(STOP)

          results << process_project(row)
        rescue => exception
          results << ProjectScanResult.new(
            project_id: row&.[](:id),
            storage_id: row&.[](:storage_id),
            state: row&.[](:state),
            status: :error,
            error_message: "#{exception.class}: #{exception.message}"
          )
        end
      end
    end

    threads.each(&:join)
    Array.new(rows.length) {results.pop}
  end

  private def process_project(row)
    project_id = row[:id]
    storage_id = row[:storage_id]
    state = row[:state]

    unless state == 'active'
      log "skip project_id=#{project_id} state=#{state}"
      return ProjectScanResult.new(project_id:, storage_id:, state:, status: :skipped_inactive)
    end

    channel_id = @channel_id_resolver.call(storage_id, project_id)
    file_bucket = @file_bucket_factory.call
    manifest = file_bucket.get_manifest(channel_id)

    raise "manifest is #{manifest.class}, expected Array" unless manifest.is_a?(Array)

    html_filenames = manifest.filter_map do |entry|
      filename = entry.is_a?(Hash) ? entry['filename'] : nil
      filename if html_file?(filename)
    end

    if html_filenames.empty?
      log "no_html project_id=#{project_id} channel_id=#{channel_id}"
      return ProjectScanResult.new(project_id:, storage_id:, state:, channel_id:, status: :no_html)
    end

    offending_files = html_filenames.filter_map do |filename|
      offending_file(file_bucket, storage_id, project_id, channel_id, filename)
    end

    if offending_files.empty?
      log "clean project_id=#{project_id} channel_id=#{channel_id} html_files=#{html_filenames.length}"
      return ProjectScanResult.new(project_id:, storage_id:, state:, channel_id:, status: :clean)
    end

    offending_files.each do |offending_file_info|
      append_bad_html_link(offending_file_info[:console_url])
    end

    offending_filenames = offending_files.map {|offending_file_info| offending_file_info[:filename]}

    log "invalid project_id=#{project_id} channel_id=#{channel_id} offending_files=#{offending_filenames.join(',')}"

    status = if @delete
               @project_deleter_factory.call(storage_id).delete(channel_id)
               append_deleted_id(project_id)
               log "deleted project_id=#{project_id} channel_id=#{channel_id}"
               :deleted
             else
               :would_delete
             end

    ProjectScanResult.new(
      project_id:,
      storage_id:,
      state:,
      channel_id:,
      status:,
      offending_filenames:
    )
  rescue => exception
    log "error project_id=#{project_id} channel_id=#{channel_id} #{exception.class}: #{exception.message}"

    ProjectScanResult.new(
      project_id:,
      storage_id:,
      state:,
      channel_id:,
      status: :error,
      error_message: "#{exception.class}: #{exception.message}"
    )
  end

  private def offending_file(file_bucket, storage_id, project_id, channel_id, filename)
    response = file_bucket.get(channel_id, filename)
    raise "file #{filename.inspect} returned #{response[:status]}" unless response[:status] == 'FOUND'

    return if @html_validator.call(response[:body].read)

    {
      filename: filename,
      console_url: bad_html_console_url(file_bucket, storage_id, project_id, filename, response[:version_id]),
    }
  end

  private def html_file?(filename)
    File.extname(filename.to_s.downcase) == '.html'
  end

  private def bad_html_console_url(file_bucket, storage_id, project_id, filename, version_id)
    key = file_bucket.send(:s3_path, storage_id, project_id, filename)
    query = ["region=#{ERB::Util.url_encode(CDO.aws_region)}", "prefix=#{ERB::Util.url_encode(key)}"]
    query << "versionId=#{ERB::Util.url_encode(version_id)}" if version_id
    "https://s3.console.aws.amazon.com/s3/object/#{CDO.files_s3_bucket}?#{query.join('&')}"
  end

  private def append_deleted_id(project_id)
    @deleted_ids_mutex.synchronize do
      ensure_directory_for(@deleted_ids_path)
      @deleted_ids_file ||= File.open(@deleted_ids_path, 'a').tap do |file|
        file.sync = true
      end

      @deleted_ids_file.write("#{project_id}\n")
      @deleted_ids_file.flush
    end

    log "deleted_id_appended project_id=#{project_id} path=#{@deleted_ids_path}"
  end

  private def append_bad_html_link(console_url)
    @bad_html_links_mutex.synchronize do
      ensure_directory_for(@bad_html_links_path)
      @bad_html_links_file ||= File.open(@bad_html_links_path, 'a').tap do |file|
        file.sync = true
      end

      @bad_html_links_file.write("#{console_url}\n")
      @bad_html_links_file.flush
    end

    log "bad_html_link_appended path=#{@bad_html_links_path} url=#{console_url}"
  end

  private def log_batch_end(batch_number, last_completed_id, results)
    counts = results.each_with_object(Hash.new(0)) do |result, memo|
      memo[result.status] += 1
    end

    summary = counts.sort_by {|status, _| status.to_s}.map {|status, count| "#{status}=#{count}"}.join(' ')
    log "batch_end number=#{batch_number} last_completed_id=#{last_completed_id} #{summary}"
  end

  private def write_checkpoint(last_completed_id)
    ensure_directory_for(@checkpoint_path)

    directory = File.dirname(@checkpoint_path)
    basename = File.basename(@checkpoint_path)
    temp_path = File.join(directory, ".#{basename}.tmp.#{Process.pid}")

    File.open(temp_path, 'w') do |file|
      file.write("#{last_completed_id}\n")
      file.flush
      file.fsync
    end

    File.rename(temp_path, @checkpoint_path)
    log "checkpoint last_completed_id=#{last_completed_id} path=#{@checkpoint_path}"
  end

  private def log(message)
    @logger.puts(message)
    @logger.flush if @logger.respond_to?(:flush)
  end

  private def ensure_directory_for(path)
    FileUtils.mkdir_p(File.dirname(path))
  end
end

if __FILE__ == $PROGRAM_NAME
  $stdout.sync = true

  options = DeleteProblematicWeblab1Projects.parse_options(ARGV)
  checkpoint_path = DeleteProblematicWeblab1Projects.default_checkpoint_path(delete: options[:delete])

  start_id = DeleteProblematicWeblab1Projects.resolve_start_id(
    start_id: options[:start_id],
    checkpoint_path:
  )

  DeleteProblematicWeblab1Projects.new(
    start_id:,
    batch_size: options[:batch_size],
    worker_count: options[:worker_count],
    checkpoint_every_batches: options[:checkpoint_every_batches],
    delete: options[:delete],
    checkpoint_path:,
    deleted_ids_path: DeleteProblematicWeblab1Projects.default_deleted_ids_path(delete: options[:delete]),
    bad_html_links_path: DeleteProblematicWeblab1Projects.default_bad_html_links_path(delete: options[:delete])
  ).run
end
