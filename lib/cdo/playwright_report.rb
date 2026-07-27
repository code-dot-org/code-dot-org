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
    # @return [String, nil] versioned public URL of index.html, or nil if the
    #   report is missing or the upload fails (best-effort; never raises).
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
        # Keep the ?versionId=: the key is overwritten every run, so this is the
        # only permanent link to this run's report. The report embeds its own
        # results, so it renders in full; only trace attachments 404, the
        # version leaking onto the sibling data/ requests the SPA resolves
        # against its own URL. index_url is the unversioned link for those.
        index_url = url if name == 'index.html'
      end
      index_url
    rescue StandardError => exception
      CDO.log.error "Failed to upload Playwright report: #{exception.message}"
      nil
    end

    # The unversioned key, which serves the latest upload. Computed without
    # uploading, so the report can also be linked before the run finishes.
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
