require 'rack/mime'
require 'socket'
require 'cdo/aws/s3'
require 'cdo/git_utils'

module Cdo
  # Publishes a Playwright HTML report to the public cucumber-logs bucket so it
  # renders directly in a browser, reusing the same S3 uploader as the Cucumber
  # UI tests (see dashboard/test/ui/runner.rb).
  #
  # The S3 prefix mirrors runner.rb's scheme: per-CI-build under Drone, else
  # "{hostname}/{branch}". On a DTT run (not Drone CI) the prefix is stable, so
  # each run overwrites the previous report at the same keys.
  module PlaywrightReport
    BUCKET = 'cucumber-logs'.freeze

    # Recursively upload report_dir, preserving relative paths and per-file
    # content types.
    # @param report_dir [String] path to the playwright-report directory
    # @return [String, nil] public URL of index.html, or nil if the report is
    #   missing or the upload fails (best-effort; never raises).
    def self.upload(report_dir)
      return nil unless File.directory?(report_dir)

      uploader = AWS::S3::LogUploader.new(BUCKET, "#{prefix}/playwright", make_public: true)
      index_url = nil
      Dir.glob(File.join(report_dir, '**', '*')).each do |path|
        next unless File.file?(path)
        name = path.delete_prefix("#{report_dir}/")
        content_type = Rack::Mime.mime_type(File.extname(path), 'application/octet-stream')
        url = File.open(path, 'rb') do |body|
          uploader.upload_log(name, body, content_type: content_type)
        end
        # Return the unversioned URL: the report SPA resolves sibling data/
        # attachments relative to its own URL, so a ?versionId= (which belongs
        # to index.html) leaks onto those requests and 404s. The bare key serves
        # the latest upload, matching the overwrite-per-run behavior anyway.
        index_url = url.split('?', 2).first if name == 'index.html'
      end
      index_url
    rescue StandardError => exception
      CDO.log.error "Failed to upload Playwright report: #{exception.message}"
      nil
    end

    # Computed without uploading, so the report can be linked before the run finishes.
    def self.index_url
      AWS::S3.public_url(BUCKET, "#{prefix}/playwright/index.html")
    rescue StandardError => exception
      CDO.log.error "Failed to compute Playwright report URL: #{exception.message}"
      nil
    end

    def self.prefix
      if ENV['CI']
        "circle/#{ENV.fetch('CI_BUILD_NUMBER', nil)}"
      else
        "#{Socket.gethostname}/#{GitUtils.current_branch}"
      end
    end
  end
end
