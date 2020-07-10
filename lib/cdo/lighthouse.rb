require 'cdo/rake_utils'
require 'cdo/aws/s3'
require 'tmpdir'
require 'cdo/chat_client'
require 'cdo/aws/metrics'
require 'uri'

# Run `lighthouse` web-page audits.
module Lighthouse
  S3_LOGS_BUCKET = 'cdo-build-logs'.freeze
  S3_LOGS_PREFIX = CDO.name.freeze

  class Error < ::RuntimeError; end
  class ConsoleError < ::RuntimeError; end

  # Runs `lighthouse` against the provided URL, returning HTML and JSON output.
  def self.test(url)
    html, json = Dir.mktmpdir do |dir|
      exts = %w[html json]
      RakeUtils.system 'lighthouse',
        "--chrome-flags='--headless'",
        "--emulated-form-factor=desktop",
        '--quiet',
        *exts.map {|x| "--output=#{x}"},
        "--output-path=#{dir}/lighthouse",
        "'#{url}'"
      exts.map {|x| File.read("#{dir}/lighthouse.report.#{x}")}
    end

    # Raise Lighthouse::Error on any runtime warnings/errors or console errors.
    result = JSON.parse(json)
    if (warnings = result['runWarnings']).any?
      raise Error.new(warnings.join("\n"))
    end
    if (error = result['runtimeError'])['code'] != 'NO_ERROR'
      raise Error.new("#{error['code']}: #{error['message']}")
    end
    if (errors = result.dig('audits', 'errors-in-console'))['score'] == 0
      str = "#{errors['title']}:\n#{errors['details']['items'].to_yaml(line_width: -1)}"
      raise ConsoleError.new(str)
    end

    [html, json]
  end

  # Run a Lighthouse test and report page speed results and metrics.
  # Upload full reports to S3 for .
  def self.report(url)
    url = URI.parse(url) unless url.is_a?(URI)
    html, json = test(url)

    upload = AWS::S3::LogUploader.new(S3_LOGS_BUCKET, S3_LOGS_PREFIX)
    key = "lighthouse/#{url.host}#{url.path}"
    html_url = upload.upload_log("#{key}.html", html)
    upload.upload_log("#{key}.json", json)

    perf = (JSON.parse(json).dig('categories', 'performance', 'score') * 100).to_i
    ChatClient.log "#{url} Page Speed: <a href='#{html_url}'>#{perf}</a>"
    Cdo::Metrics.put 'Website/PageSpeed', perf,
      Environment: CDO.rack_env, URL: url.to_s
  rescue => e
    ChatClient.log "Page speed report failed: #{e}"
  end
end
