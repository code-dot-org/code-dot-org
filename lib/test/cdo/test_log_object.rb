require_relative '../test_helper'
require 'cdo/log_object'

class LogObjectTest < Minitest::Test
  def test_time_a_function
    log_object = LogObject.new
    log_object.time('Do something') {do_something}

    assert log_object.ok?
    assert_equal 1, log_object.logs.size
  end

  def test_time_a_function_that_errors
    log_object = LogObject.new
    log_object.time('Do something that errors') {do_something_that_errors}

    refute log_object.ok?
    assert_equal 2, log_object.logs.size
  end

  def test_time_a_function_that_errors_then_reraise
    log_object = LogObject.new

    assert_raises do
      log_object.time!('Do something that errors') {do_something_that_errors}
    end

    assert_equal 1, log_object.logs.size
  end

  private

  # Dummy function to be used in a block
  def do_something
    1
  end

  def do_something_that_errors
    raise 'error'
  end
end
