require_relative '../../test_helper'
require 'open3'
require 'shellwords'

# Regression coverage for the require that lets download_from_bucket reach
# Cdo::LocalDevelopment when CDO.aws_s3_emulated is set.
#
# These run in a subprocess on purpose. The constant is reachable from inside
# this suite whatever s3.rb does, because something else has already required
# it; only a process that loaded s3.rb alone can tell the difference.
class CdoAwsS3LocalDevelopmentTest < Minitest::Test
  REPO_ROOT = File.expand_path('../../../../', __dir__)

  def test_local_development_is_reachable_from_s3_alone
    out, status = run_ruby(<<~RUBY)
      require 'cdo/aws/s3'
      AWS::S3.singleton_class.class_eval { def create_client; raise 'unreachable'; end }
      begin
        AWS::S3.download_from_bucket('bucket', 'key')
      rescue NameError => e
        puts "NAME_ERROR \#{e.message}"
      rescue RuntimeError => e
        # Reached the client, so the constant resolved.
        puts(e.message == 'unreachable' ? 'RESOLVED' : "OTHER \#{e.message}")
      end
    RUBY

    assert status.success?, "subprocess failed: #{out}"
    refute_includes out, 'NAME_ERROR', 'download_from_bucket cannot reach Cdo::LocalDevelopment'
    assert_includes out, 'RESOLVED'
  end

  def test_s3_still_loads_on_its_own
    # cdo/local_development requires cdo/aws/s3 back. Loading either first has
    # to work.
    ['cdo/aws/s3', 'cdo/local_development'].each do |first|
      out, status = run_ruby(<<~RUBY)
        require '#{first}'
        require 'cdo/aws/s3'
        require 'cdo/local_development'
        puts AWS::S3.respond_to?(:download_from_bucket) && !!Cdo::LocalDevelopment
      RUBY
      assert status.success?, "requiring #{first} first failed: #{out}"
      assert_includes out, 'true', "requiring #{first} first left the pair half-loaded"
    end
  end

  # Runs src in a clean process with aws_s3_emulated on, so the guarded branch
  # in download_from_bucket is the one taken.
  private def run_ruby(src)
    script = "require './deployment'; CDO.stubs = nil if CDO.respond_to?(:stubs); " \
      "def CDO.aws_s3_emulated; true; end\n#{src}"
    Open3.capture2e(
      {'RACK_ENV' => 'test', 'RAILS_ENV' => 'test'},
      'bundle', 'exec', 'ruby', '-e', script,
      chdir: REPO_ROOT
    )
  end
end
