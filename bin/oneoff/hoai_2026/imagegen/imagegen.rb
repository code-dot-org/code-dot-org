# What generate_images, validate_images and review_images share: the jobs
# dump_prompts.ts describes, where each variant's files and record live, and
# the attic that replaced images move to.
#
# A job is one filled sentence in one style; a variant is one drawing of it,
# numbered from 00. Its frames are 'single' for one picture, or 'base' and
# the four poses for a character set. Paths follow imageCache.ts in apps/:
#
#   image_output/v1/<sentence>/<word>/<word>/<style>/NN.png        one picture
#   image_output/v1/<sentence>/<word>/<word>/<style>/NN-base.png   a set's frame
#   image_records/v1/<sentence>/<word>/<word>/<style>/NN.json      never published

require 'fileutils'
require 'json'
require 'open3'
require 'rmagick'
require 'time'

require_relative 'constants'

# Raised for a request that should not be retried.
class ImageRequestError < StandardError; end

# Raised for a request worth another attempt.
class RetryableImageRequestError < StandardError; end

SCRIPT_PATH = File.expand_path(__dir__)
REPO_PATH = File.expand_path('../../../..', SCRIPT_PATH)

def output_path
  File.join(SCRIPT_PATH, OUTPUT_DIRECTORY)
end

def records_path
  File.join(SCRIPT_PATH, RECORDS_DIRECTORY)
end

def attic_path
  File.join(SCRIPT_PATH, ATTIC_DIRECTORY)
end

def check_node!
  version = begin
    `node --version`.strip[/\d+/].to_i
  rescue Errno::ENOENT
    0
  end
  return if version >= 18
  raise "Error: dump_prompts.ts needs Node 18 or newer (found #{version.zero? ? 'none' : version}). Try `nvm use 22`."
end

# Runs dump_prompts.ts and returns its stdout. Its stderr carries notes (a
# pinned sentences.json that differs from the lab's), so it is shown.
def run_dumper(*args)
  check_node!
  stdout, stderr, status = Open3.capture3(
    'npx', '--yes', 'tsx', File.join(SCRIPT_PATH, 'dump_prompts.ts'), *args,
    chdir: REPO_PATH
  )
  warn stderr unless stderr.strip.empty?
  raise 'Error: dump_prompts.ts failed' unless status.success?
  stdout
end

# Every job, freshly dumped and cached in PROMPTS_FILE.
def load_jobs(*args)
  stdout = run_dumper(*args)
  File.write(File.join(SCRIPT_PATH, PROMPTS_FILE), stdout)
  stdout.lines.map {|line| JSON.parse(line)}
end

def variant_name(variant)
  variant.to_s.rjust(2, '0')
end

def job_folder(job)
  File.join(CACHE_VERSION, job['sentenceId'], *job['wordIds'], job['style'])
end

# frameFileName() in imageCache.ts.
def frame_file(job, variant, frame_name)
  job['animated'] ? "#{variant_name(variant)}-#{frame_name}.png" : "#{variant_name(variant)}.png"
end

def frame_path(job, variant, frame_name)
  File.join(job_folder(job), frame_file(job, variant, frame_name))
end

def record_path(job, variant)
  File.join(job_folder(job), "#{variant_name(variant)}.json")
end

def read_record(job, variant)
  path = File.join(records_path, record_path(job, variant))
  File.exist?(path) ? JSON.parse(File.read(path)) : nil
end

def write_record(job, variant, record)
  path = File.join(records_path, record_path(job, variant))
  FileUtils.mkdir_p(File.dirname(path))
  File.write("#{path}.tmp", JSON.pretty_generate(record))
  File.rename("#{path}.tmp", path)
end

def frame_exists?(job, variant, frame_name)
  File.exist?(File.join(output_path, frame_path(job, variant, frame_name)))
end

def frames_present(job, variant)
  job['frames'].map {|frame| frame['name']}.select {|name| frame_exists?(job, variant, name)}
end

# Moves a variant's frames out of the published tree into the attic, under
# the same path with the time appended, and returns where they went.
def move_to_attic(job, variant)
  stamp = Time.now.utc.strftime('%Y%m%dT%H%M%S%L')
  frames_present(job, variant).map do |name|
    relative = frame_path(job, variant, name)
    destination = File.join(attic_path, relative.sub(/\.png\z/, ".#{stamp}.png"))
    FileUtils.mkdir_p(File.dirname(destination))
    File.rename(File.join(output_path, relative), destination)
    destination.delete_prefix("#{SCRIPT_PATH}/")
  end
end

# The tree holds PNG only (imageCache.ts). Gemini returns a JPEG as readily;
# the live path decodes it and draws on a canvas that encodes PNG, so
# converting here hands the lab the same pixels.
def to_png(bytes)
  image = Magick::Image.from_blob(bytes).first
  return bytes if image.format == 'PNG'
  image.format = 'PNG'
  image.to_blob
ensure
  image&.destroy!
end

# The lab's verdict on a variant from its record: 'pass' when every frame
# passed every check the run requires, else why not.
def moderation_summary(record, require_judge:)
  return 'pending' unless record && record['frames']
  checks = record['frames'].map {|frame| frame['checks'] || {}}
  verdicts = checks.flat_map {|check| check.values.map {|result| result['verdict']}}
  verdicts << record.dig('promptCheck', 'verdict') if record['promptCheck']
  return 'flagged' if verdicts.include?('flagged')
  return 'error' if verdicts.include?('error')
  return 'pending' if checks.any? {|check| check['azure'].nil?}
  return 'pending' if require_judge && checks.any? {|check| check['judge'].nil?}
  'pass'
end

def review_verdict(record)
  record&.dig('review', 'verdict')
end
