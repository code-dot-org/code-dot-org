#!/usr/bin/env ruby
# bin/oneoff/hoai_2025/hoai_image_doctor.rb

require 'optparse'
require 'fileutils'
require 'parallel'
require 'ruby-progressbar'
require 'aws-sdk-s3'
require File.expand_path('../../../../dashboard/config/environment', __FILE__)
require_relative '../../../lib/cdo/aws/s3'
require_relative '../../../deployment'

DOCTOR_TOOLS = ['regen_transparent_eyes', 'trim_edges', 'clean_edge_artifacts']

# S3 settings (same path scheme as generator harness)
BUCKET_NAME_BASE = 'cdo-curriculum'.freeze
BUCKET_PATH      = 'media/musiclab/generate/dancer/'.freeze

options = {
  tool: nil,
  input: nil,
  output: nil,
  inplace: false,       # only for transparent_eyes
  verbose: true,
  dry_run: false,
  python_root: nil,
  model: 'gpt-image-1',
  size: '1024x1024',
  upload: false,
  production: false,
  pixels: 4,
  band: 6,
  tolerance: 18.0,
  feather: 1.5,
  keep_format: false
}

parser = OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage:
      ruby #{File.basename(__FILE__)} --tool TOOL --input DIR [options]

    Tools:
      regen_transparent_eyes OpenAI edit -> evaluate -> HTML report
      trim_edges            Crop N pixels off all edges (Pillow) [supports --inplace]
      clean_edge_artifacts  Detect edge halos and make them transparent [supports --inplace]

    Options:
  BANNER

  opts.on('--tool TOOL', DOCTOR_TOOLS, "One of: #{DOCTOR_TOOLS.join(', ')}") {|v| options[:tool] = v}
  opts.on('--input PATH', 'Input directory (required)') {|v| options[:input] = v}
  opts.on('--output PATH', 'Output directory root') {|v| options[:output] = v}
  opts.on('--inplace', 'Modify files in-place (transparent_eyes only)') {options[:inplace] = true}
  opts.on('--[no-]verbose', 'Verbose logging (default: true)') {|v| options[:verbose] = v}
  opts.on('--python-root PATH', 'Override python package root') {|v| options[:python_root] = v}
  opts.on('--dry-run', 'Print the command and S3 plan without executing') {options[:dry_run] = true}

  # OpenAI edit params
  opts.on('--model NAME', 'OpenAI image model (default: gpt-image-1)') {|v| options[:model] = v}
  opts.on('--size WxH', 'Edit size (e.g., 512x512, 1024x1024)') {|v| options[:size] = v}

  # S3 upload toggles (mirrors generator harness)
  opts.on('--upload', 'Upload the output directory to S3 after processing') {options[:upload] = true}
  opts.on('--production', 'Use production bucket (cdo-curriculum) instead of -devel') {options[:production] = true}
  opts.on('--pixels N', Integer, 'Pixels to trim from each edge (default: 4)') {|v| options[:pixels] = v}
  opts.on('--band N', Integer, 'Edge band width to analyze/clean for clean_edge_artifacts (default: 6)') {|v| options[:band] = v}
  opts.on('--tolerance F', Float, 'RGB distance threshold for clean_edge_artifacts (default: 18.0)') {|v| options[:tolerance] = v}
  opts.on('--feather F', Float, 'Gaussian blur radius for soft alpha (default: 1.5)') {|v| options[:feather] = v}
  opts.on('--keep-format', 'Keep original extension even if it drops alpha (JPEG will flatten)') {options[:keep_format] = true}

  opts.on('-h', '--help', 'Show help and exit') {puts opts; exit 0}
end

begin
  parser.parse!
rescue OptionParser::ParseError => exception
  warn exception.message
  puts parser
  exit 2
end

if options[:tool].nil? || options[:input].nil?
  warn 'ERROR: --tool and --input DIR are required.'
  puts parser
  exit 2
end

# Resolve python root
script_dir = __dir__
default_python_root = File.expand_path(File.join(script_dir, '..', '..', '..', 'python', 'hoai_2025'))
python_root = options[:python_root] ? File.expand_path(options[:python_root]) : default_python_root
unless Dir.exist?(python_root)
  warn "ERROR: Expected python root not found: #{python_root}"
  warn "Try: --python-root /home/tshaffer/code-dot-org/python/hoai_2025"
  exit 2
end

# OpenAI key
openai_key = nil
if options[:tool] == 'regen_transparent_eyes'
  openai_key = ENV.fetch("OPENAI_API_KEY", nil) || CDO.openai_student_learning_api_key.presence
  raise "Missing OpenAI API key (set openai_student_learning_api_key or OPENAI_API_KEY)" if openai_key.nil? || openai_key.strip.empty?
end

def build_command(tool, python_root, options, openai_key)
  runner = `which uv`.strip.empty? ? 'python' : 'uv run python'

  case tool
  when 'regen_transparent_eyes'
    mod = 'hoai_2025.regen_transparent_eyes'
    in_dir  = File.expand_path(options[:input])
    out_dir = File.expand_path(options[:output] || File.join(in_dir, "_openai_edit"))
    args = []
    args << "--input '#{in_dir}'"
    args << "--output '#{out_dir}'"
    args << "--model '#{options[:model]}'"
    args << "--size '#{options[:size]}'"
    args << "-k '#{openai_key}'"
    args << "--verbose" if options[:verbose]
    env = {
      "OPENAI_API_KEY" => openai_key
    }.delete_if {|_, v| v.nil? || v == ""}
    {chdir: python_root, cmd: "#{runner} -m #{mod} #{args.join(' ')}", env: env, output_dir: out_dir}

  when 'trim_edges'
    mod = 'hoai_2025.trim_edges'
    in_dir  = File.expand_path(options[:input])
    out_dir = File.expand_path(options[:output] || File.join(in_dir, "_trimmed"))
    args = []
    args << "--input '#{in_dir}'"
    # Only pass --output when not doing inplace
    unless options[:inplace]
      args << "--output '#{out_dir}'"
    end
    args << "--pixels #{Integer(options[:pixels] || 4)}"
    args << "--inplace" if options[:inplace]
    args << "--verbose" if options[:verbose]
    {chdir: python_root, cmd: "#{runner} -m #{mod} #{args.join(' ')}", env: {}, output_dir: (options[:inplace] ? in_dir : out_dir)}

  when 'clean_edge_artifacts'
    mod = 'hoai_2025.clean_edge_artifacts'
    in_dir  = File.expand_path(options[:input])
    out_dir = File.expand_path(options[:output] || File.join(in_dir, "_edgeclean"))
    args = []
    args << "--input '#{in_dir}'"
    unless options[:inplace]
      args << "--output '#{out_dir}'"
    end
    args << "--band #{Integer(options[:band] || 6)}"
    args << "--tolerance #{Float(options[:tolerance] || 18.0)}"
    args << "--feather #{Float(options[:feather] || 1.5)}"
    args << "--inplace" if options[:inplace]
    args << "--keep-format" if options[:keep_format]
    args << "--verbose" if options[:verbose]
    {chdir: python_root, cmd: "#{runner} -m #{mod} #{args.join(' ')}", env: {}, output_dir: (options[:inplace] ? in_dir : out_dir)}

  else
    raise "Unknown tool: #{tool}"
  end
end

job = build_command(options[:tool], python_root, options, openai_key)

puts "[doctor] Tool: #{options[:tool]}"
puts "[doctor] Workdir: #{job[:chdir]}"
puts "[doctor] Command: #{job[:cmd]}"
puts "[doctor] Output dir (for upload): #{job[:output_dir]}"

if options[:dry_run]
  puts "[doctor] Dry run: not executing Python or upload."
  exit 0
end

# Run Python tool
ok = nil
Dir.chdir(job[:chdir]) do
  ok = system(job[:env] || {}, job[:cmd])
end
exit(($?.exitstatus || 1)) unless ok

# Optional upload step
if options[:upload]
  bucket_name = "#{BUCKET_NAME_BASE}#{options[:production] ? '' : '-devel'}"
  output_root = job[:output_dir]
  unless Dir.exist?(output_root)
    warn "Upload skipped: output directory not found: #{output_root}"
    exit 1
  end

  puts
  puts "Uploading to `#{bucket_name}` …"
  unless options[:production]
    puts "Note: Using devel bucket. Add --production to publish to the prod bucket."
  end

  # Collect files
  objects = {}
  Dir.glob(File.join(output_root, '**', '*.*')).each do |filepath|
    next if File.directory?(filepath)
    rel = filepath[(output_root.length + 1)..]
    objects[rel] = filepath
  end

  if objects.empty?
    puts "No files to upload under: #{output_root}"
    exit 0
  end

  progress = ProgressBar.create(total: objects.size)
  Parallel.map(objects.keys,
               finish: ->(_, _, _) {progress&.increment}
  ) do |rel|
    path = objects[rel]
    key  = File.join(BUCKET_PATH, rel)

    if rel.end_with?('.png')
      AWS::S3.upload_to_bucket(
        bucket_name,
        key,
        File.read(path, mode: 'rb'),
        acl: 'public-read',
        no_random: true,
        content_type: 'image/png'
      )
    elsif rel.end_with?('.html')
      AWS::S3.upload_to_bucket(
        bucket_name,
        key,
        File.read(path),
        acl: 'public-read',
        no_random: true,
        content_type: 'text/html; charset=utf-8'
      )
    else
      # allow any other assets if present (e.g., json)
      content_type =
        if rel.end_with?('.json') then 'application/json'
        elsif rel.end_with?('.csv') then 'text/csv'
        else
          'application/octet-stream'
        end
      AWS::S3.upload_to_bucket(
        bucket_name,
        key,
        File.read(path, mode: rel.end_with?('.json') ? 'r' : 'rb'),
        acl: 'public-read',
        no_random: true,
        content_type: content_type
      )
    end
    true
  end
  progress&.finish
  puts "Done uploading."
end
