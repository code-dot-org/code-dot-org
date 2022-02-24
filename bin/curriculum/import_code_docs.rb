require 'json'
require 'optparse'
require 'uri'
require 'net/http'
require_relative '../../deployment'

raise unless [:development, :adhoc, :levelbuilder].include? rack_env

$verbose = false
def log(str)
  puts str if $verbose
end

$quiet = false
def warn(str)
  puts str unless $quiet && !$verbose
end

# Wait until after initial error checking before loading the rails environment.
def require_rails_env
  log "loading rails environment..."
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  log "rails environment loaded in #{(Time.now - start_time).to_i} seconds."
end

def parse_options
  OpenStruct.new.tap do |options|
    options.local = false
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = <<~BANNER

        Usage: #{$0} [options]

      BANNER

      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on('-q', '--quiet', 'Silence warnings.') do
        $quiet = true
      end

      opts.on('-v', '--verbose', 'Use verbose debug logging.') do
        $verbose = true
      end

      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end

    opt_parser.parse!(ARGV)
  end
end

def main(options)
  cb_url_prefix = options.local ? 'http://localhost:8000' : 'http://www.codecurricula.com'

  ProgrammingEnvironment.all.each do |env|
    env.programming_expressions.each do |exp|
      url = "#{cb_url_prefix}/docs/export/block/#{env.name}/#{exp.key}.json?format=json"
      cb_exp_json = fetch(url)

      if cb_exp_json.blank?
        warn "Received non-success status for #{url}"
      end

      next if cb_exp_json.blank?

      next if options.dry_run

      cb_exp = JSON.parse(cb_exp_json)

      exp.name = cb_exp['title']
      exp.content = cb_exp['content']
      exp.short_description = cb_exp['description']
      exp.external_documentation = cb_exp['ext_doc']
      exp.return_value = cb_exp['return_value']
      exp.tips = cb_exp['tips']
      if cb_exp['image']
        log "#{exp.key} has an image at #{cb_exp['image']}"
        exp.image_url = cb_exp['image']
      end
      if cb_exp['video']
        log "#{exp.key} has a video with URL #{cb_exp['video']}"
      end
      exp.examples = cb_exp['examples']
      exp.examples.each do |example|
        example['code'] = "```\n#{example['code']}\n```" if example['code']
      end
      exp.palette_params = cb_exp['parameters']

      category = exp.programming_environment.categories.find_by_name(cb_exp['category'])
      exp.programming_environment_category = category if category
      warn "#{exp.key} is in a non-existant category #{cb_exp['category']}" unless category

      exp.save!

      exp.write_serialization
    end
  end
end

def fetch(url)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)
  unless response.is_a? Net::HTTPSuccess
    warn "Received non-success status #{response.code} fetching #{uri}"
    return nil
  end
  body = response.body
  log "fetched #{body.length} bytes of code docs json from #{uri}"
  body
end

options = parse_options

require_rails_env
main(options)
