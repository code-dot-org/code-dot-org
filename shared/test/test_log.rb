require_relative 'test_helper'

class LogTest < Minitest::Test
  def setup
    @old_log = CDO.log
  end

  def teardown
    CDO.log = @old_log
  end

  def test_default_log
    out, _ = capture_subprocess_io do
      CDO.log.info 'test'
    end
    assert_equal "test\n", out
  end

  def test_override_log
    CDO.log = Logger.new(STDOUT).tap do |l|
      l.formatter = proc do |_, _, _, msg|
        "TEST LOG: #{msg}"
      end
    end

    out, _ = capture_subprocess_io do
      CDO.log.info 'test'
    end
    assert_equal 'TEST LOG: test', out
  end
end
