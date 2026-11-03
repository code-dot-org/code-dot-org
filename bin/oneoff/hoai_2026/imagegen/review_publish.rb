# Publishes what a preview of the cache needs beyond the tree the lab reads:
# every drawing moderation flagged or review rejected, the current drawing
# of a variant held back from the tree, and a manifest per sentence that
# says what each file is.
#
#   review/v1/index.json                         the sentences, with counts
#   review/v1/<sentence>/manifest.json           every filling and variant
#   review/v1/<sentence>/manifest.js             the same, for a <script> tag
#   review/v1/<sentence>/<words>/pixel/<file>    the drawings, never renamed
#
# under media/spritelab/generate/, beside images/. A file name carries the
# time of its drawing, so a file is never replaced and never needs fetching
# again. The devel bucket sends no CORS headers, so a page elsewhere reads a
# manifest there through manifest.js; the production bucket allows any
# origin to fetch manifest.json.

require 'json'
require 'time'

require_relative 'imagegen'

# What has been uploaded to each bucket: a key, and the drawing (drawnAt)
# it holds, so an unchanged file is not sent again and a manifest can tell
# whether the lab's tree holds a variant's current drawing.
class UploadLedger
  def initialize(bucket)
    @path = File.join(SCRIPT_PATH, UPLOAD_LEDGER_FILE)
    @bucket = bucket
    @all = File.exist?(@path) ? JSON.parse(File.read(@path)) : {}
    @keys = (@all[bucket] ||= {})
    @lock = Mutex.new
  end

  def holds?(key, drawing)
    @lock.synchronize {@keys[key] == drawing}
  end

  def record(key, drawing)
    @lock.synchronize {@keys[key] = drawing}
  end

  def save
    @lock.synchronize do
      File.write("#{@path}.tmp", JSON.pretty_generate(@all))
      File.rename("#{@path}.tmp", @path)
    end
  end
end

# 2026-11-03T07:56:26.659Z -> 20261103T075626659, the stamp move_to_attic
# writes. A drawing's time names its file, so it must tell two drawings
# apart: a variant can be redrawn within a second.
def compact_time(iso)
  Time.iso8601(iso).utc.strftime('%Y%m%dT%H%M%S%L')
end

# A frame's name from an attic or review file name: 00.<time>.png is a
# single picture, 00-base.<time>.png a set's base.
def frame_name_of(file)
  stem = File.basename(file).split('.').first
  stem.include?('-') ? stem.split('-', 2).last : 'single'
end

class ReviewPublisher
  # status_for: (job, variant) -> nil when the variant may be published,
  # else why not; the same rules the upload follows.
  def initialize(options, bucket, catalog, status_for)
    @options = options
    @bucket = bucket
    @catalog = catalog.to_h {|entry| [entry['sentenceId'], entry]}
    @status_for = status_for
    @ledger = UploadLedger.new(bucket)
    @uploads = []
  end

  attr_reader :ledger

  # Builds the manifests for these sentences' jobs, every filling of each,
  # and the index over all sentences; then uploads what is not yet there,
  # unless this is a dry run.
  def publish(jobs_by_sentence, all_sentence_ids)
    manifests = jobs_by_sentence.to_h do |sentence_id, jobs|
      [sentence_id, manifest_for(sentence_id, jobs)]
    end
    manifests.each {|sentence_id, manifest| write_local(sentence_id, manifest)}
    index = index_for(all_sentence_ids)
    write_local_index(index)

    pending = @uploads.uniq {|upload| upload[:key]}.reject {|upload| @ledger.holds?(upload[:key], upload[:drawing])}
    puts
    puts "Review: #{manifests.length} manifest(s), #{pending.length} new drawing(s) to upload, " \
         "#{@uploads.length - pending.length} already uploaded."
    puts "        Local copies of the manifests are in #{REVIEW_MANIFESTS_DIRECTORY}/."
    return if @options[:dry_run]

    upload_files(pending)
    manifests.each do |sentence_id, manifest|
      upload_json("#{REVIEW_PATH}/#{CACHE_VERSION}/#{sentence_id}/manifest", manifest, "__imagegenReview[#{sentence_id.to_json}]")
    end
    upload_json("#{REVIEW_PATH}/#{CACHE_VERSION}/index", index, '__imagegenReview.index')
    @ledger.save
    puts "Review published: #{PUBLIC_GENERATE_URLS[@options[:production] ? 'production' : 'devel']}review/#{CACHE_VERSION}/index.json"
  end

  private def manifest_for(sentence_id, jobs)
    catalog = @catalog[sentence_id] || {}
    variants = [@options[:variants], VARIANTS].max
    {
      version: CACHE_VERSION,
      sentenceId: sentence_id,
      generatedAt: Time.now.utc.iso8601,
      bases: PUBLIC_GENERATE_URLS,
      bucket: @bucket,
      animated: catalog['animated'],
      slots: (catalog['slots'] || []).map do |slot|
        {id: slot['id'], label: slot['label'], required: slot['required'], words: slot['words']}
      end,
      fillings: jobs.map do |job|
        {
          wordIds: job['wordIds'],
          prompt: job['prompt'],
          frames: job['frames'].map {|frame| frame['name']},
          variants: Array.new(variants) {|variant| variant_entry(job, variant)},
        }
      end,
    }
  end

  private def variant_entry(job, variant)
    record = read_record(job, variant)
    current = current_entry(job, variant, record)
    status =
      if record.nil? || current.nil?
        record&.dig('abandoned') ? 'abandoned' : 'not drawn'
      elsif current[:published]
        'published'
      else
        reason = @status_for.call(job, variant)
        reason ? "held back: #{reason}" : 'ready'
      end
    {
      variant: variant,
      status: status,
      current: current,
      rejected: (record&.dig('history') || []).map {|entry| rejected_entry(job, entry)}.compact,
    }
  end

  # The current drawing: from the lab's tree when this bucket holds it
  # there, else a copy in the review tree named for when it was drawn.
  private def current_entry(job, variant, record)
    return nil unless record && record['drawnAt']
    names = job['frames'].map {|frame| frame['name']}
    return nil unless names.all? {|name| frame_exists?(job, variant, name)}

    published = names.all? do |name|
      @ledger.holds?("#{BUCKET_PATH}/#{frame_path(job, variant, name)}", record['drawnAt'])
    end
    stamp = compact_time(record['drawnAt'])
    frames = names.to_h do |name|
      relative = frame_path(job, variant, name)
      next [name, "images/#{relative}"] if published

      copy = "review/#{relative.sub(/\.png\z/, ".#{stamp}.png")}"
      @uploads << {local: File.join(output_path, relative), key: "#{GENERATE_PATH}/#{copy}", drawing: record['drawnAt']}
      [name, copy]
    end
    {
      published: published,
      drawnAt: record['drawnAt'],
      seed: record['seed'],
      model: record['model'],
      frames: frames,
      checks: (record['frames'] || []).to_h {|frame| [frame['name'], frame['checks']]},
      review: record['review'],
    }.compact
  end

  # A drawing that left the tree: why, its checks and review, and its files,
  # which keep their attic names.
  private def rejected_entry(job, entry)
    moved = entry['movedTo'] || []
    return nil if moved.empty?
    frames = moved.to_h do |path|
      copy = "review/#{path.delete_prefix("#{ATTIC_DIRECTORY}/")}"
      @uploads << {local: File.join(SCRIPT_PATH, path), key: "#{GENERATE_PATH}/#{copy}", drawing: 'attic'}
      [frame_name_of(path), copy]
    end
    {
      at: entry['at'],
      reason: entry['reason'],
      seed: entry['seed'],
      model: entry['model'],
      frames: frames,
      checks: entry['checks'],
      review: entry['review'],
    }.compact
  end

  # Counts per sentence from the local manifests, so a run over one
  # sentence keeps the others in the index.
  private def index_for(all_sentence_ids)
    {
      version: CACHE_VERSION,
      generatedAt: Time.now.utc.iso8601,
      bases: PUBLIC_GENERATE_URLS,
      sentences: all_sentence_ids.filter_map do |sentence_id|
        path = File.join(SCRIPT_PATH, REVIEW_MANIFESTS_DIRECTORY, CACHE_VERSION, sentence_id, 'manifest.json')
        next nil unless File.exist?(path)
        manifest = JSON.parse(File.read(path))
        statuses = manifest['fillings'].flat_map {|filling| filling['variants'].map {|v| v['status'].split(':').first}}
        {
          sentenceId: sentence_id,
          manifest: "review/#{CACHE_VERSION}/#{sentence_id}/manifest.json",
          script: "review/#{CACHE_VERSION}/#{sentence_id}/manifest.js",
          generatedAt: manifest['generatedAt'],
          fillings: manifest['fillings'].length,
          variants: statuses.tally,
          rejected: manifest['fillings'].sum {|filling| filling['variants'].sum {|v| v['rejected'].length}},
        }
      end,
    }
  end

  private def write_local(sentence_id, manifest)
    path = File.join(SCRIPT_PATH, REVIEW_MANIFESTS_DIRECTORY, CACHE_VERSION, sentence_id, 'manifest.json')
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(manifest))
  end

  private def write_local_index(index)
    path = File.join(SCRIPT_PATH, REVIEW_MANIFESTS_DIRECTORY, CACHE_VERSION, 'index.json')
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(index))
  end

  private def upload_files(pending)
    progress = ProgressBar.create(total: pending.size)
    Parallel.each(pending, in_threads: @options[:jobs], finish: ->(_, _, _) {progress&.increment}) do |upload|
      AWS::S3.upload_to_bucket(
        @bucket, upload[:key], File.binread(upload[:local]),
        acl: 'public-read', no_random: true, content_type: 'image/png'
      )
      @ledger.record(upload[:key], upload[:drawing])
    end
    progress&.finish
  end

  # A manifest as JSON, and as a script that assigns it to a global: a
  # <script> tag is not held to CORS, which the devel bucket does not send.
  # Neither is cached, so a preview sees the latest.
  private def upload_json(key, value, global)
    json = JSON.generate(value)
    script = "window.__imagegenReview = window.__imagegenReview || {};\nwindow.#{global} = #{json};\n"
    [["#{key}.json", json, 'application/json'], ["#{key}.js", script, 'application/javascript']].each do |path, body, type|
      AWS::S3.upload_to_bucket(
        @bucket, path, body,
        acl: 'public-read', no_random: true, content_type: type, cache_control: 'no-cache'
      )
    end
  end
end
