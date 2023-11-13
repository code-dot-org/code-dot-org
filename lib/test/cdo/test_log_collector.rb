require_relative '../test_helper'
require 'cdo/log_collector'

class LogCollectorTest < Minitest::Test
  def test_time_a_function
    log_object = LogCollector.new
    log_object.time('Do something') {do_something}
    assert log_object.ok?
  end

  def test_time_a_function_that_errors
    log_object = LogCollector.new
    log_object.time('Do something that errors') {do_something_that_errors}
    refute log_object.ok?
    assert_equal 1, log_object.exceptions.size
  end

  def test_time_a_function_that_errors_then_reraise
    log_object = LogCollector.new
    assert_raises do
      log_object.time!('Do something that errors') {do_something_that_errors}
    end
    assert_equal 0, log_object.exceptions.size
  end

  # Dummy function to be used in a block
  private def do_something
    1
  end

  private def do_something_that_errors
    raise 'error'
  end
end
