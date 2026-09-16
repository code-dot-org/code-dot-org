require_relative '../test_helper'
require 'cdo/rake_utils'

class RakeUtilsTest < Minitest::Test
  describe 'system_stream_output' do
    # The args are joined into one shell line, so the script needs its own quotes.
    SECRET_IS_SET = %q(sh -c 'test -n "$SECRET"')

    it 'passes env_secrets to the child and logs the name redacted' do
      CDO.log.expects(:info).with {|line| line.include?('SECRET=<redacted>') && !line.include?('s3cret')}

      status = RakeUtils.system_stream_output(SECRET_IS_SET, env_secrets: {'SECRET' => 's3cret'})

      assert_equal 0, status
    end

    it 'fails the child without env_secrets' do
      CDO.log.stubs(:info)

      assert_raises(RuntimeError) {RakeUtils.system_stream_output(SECRET_IS_SET)}
    end

    it 'raises when the child fails' do
      CDO.log.stubs(:info)

      assert_raises(RuntimeError) {RakeUtils.system_stream_output('false')}
    end
  end
end
