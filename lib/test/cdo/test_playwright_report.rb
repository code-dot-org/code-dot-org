require_relative '../test_helper'
require 'tmpdir'
require 'cdo/playwright_report'

class CdoPlaywrightReportTest < Minitest::Test
  BUCKET = 'cucumber-logs'.freeze
  PREFIX = 'somehost/somebranch'.freeze
  INDEX_KEY = "#{PREFIX}/playwright/index.html".freeze

  def setup
    Cdo::PlaywrightReport.stubs(:prefix).returns(PREFIX)
  end

  # The report's own JS copies the page's query onto every same-origin link it
  # renders, and an S3 versionId is valid only for the key it came from, so a
  # versioned index URL 404s every screenshot, video and trace.
  def test_upload_returns_an_unversioned_url
    uploaded = {}
    uploader = stub
    uploader.stubs(:upload_log).with do |name, _body, options|
      uploaded[name] = options[:content_type]
      true
    end.returns("https://#{BUCKET}.s3.amazonaws.com/#{INDEX_KEY}?versionId=abc123")
    AWS::S3::LogUploader.stubs(:new).returns(uploader)
    AWS::S3.expects(:public_url).never

    url = Dir.mktmpdir do |dir|
      File.write(File.join(dir, 'index.html'), '<html></html>')
      FileUtils.mkdir_p(File.join(dir, 'data'))
      File.write(File.join(dir, 'data', 'trace.zip'), 'PK')
      Cdo::PlaywrightReport.upload(dir)
    end

    refute_includes url.to_s, 'versionId'
    assert_equal "https://#{BUCKET}.s3.amazonaws.com/#{INDEX_KEY}", url
    assert_equal({'index.html' => 'text/html', 'data/trace.zip' => 'application/zip'}, uploaded)
  end

  # One directory would lose the first suite's report.
  def test_each_suite_gets_its_own_directory
    AWS::S3::LogUploader.expects(:new).with(BUCKET, "#{PREFIX}/playwright-eyes", make_public: true).returns(stub(upload_log: nil))

    Dir.mktmpdir {|dir| Cdo::PlaywrightReport.upload(dir, name: 'playwright-eyes')}

    # The key, not the URL public_url builds from it: that URL follows the local
    # S3 configuration, and aws_s3_emulated gives it a different host.
    AWS::S3.expects(:public_url).with(BUCKET, "#{PREFIX}/playwright-eyes/index.html")
    Cdo::PlaywrightReport.index_url(name: 'playwright-eyes')
  end
end
