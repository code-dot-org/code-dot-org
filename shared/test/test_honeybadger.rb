require_relative 'test_helper'
require 'mocha/mini_test'

require 'cdo/env'
require 'cdo/honeybadger'

class HoneybadgerTest < Minitest::Test

  def teardown
    ENV.unstub(:with_sensitive_values_redacted)
  end

  COMMAND = '/home/ubuntu/staging/bin/deliver_poste_messages'

  ERROR =
    "/home/ubuntu/staging/bin/deliver_poste_messages:126:in `send': undefined method `[]' for nil:NilClass (NoMethodError)\n" +
    "\tfrom /home/ubuntu/staging/bin/deliver_poste_messages:274:in `block in main'\n" +
    "\tfrom /home/ubuntu/staging/bin/deliver_poste_messages:250:in `block (3 levels) in create_threads'"

  EXPECTED_MESSAGE = "undefined method `[]' for nil:NilClass (NoMethodError)"
  EXPECTED_BACKTRACE = [
      "/home/ubuntu/staging/bin/deliver_poste_messages:126:in `send'",
      "from /home/ubuntu/staging/bin/deliver_poste_messages:274:in `block in main'",
      "from /home/ubuntu/staging/bin/deliver_poste_messages:250:in `block (3 levels) in create_threads'"
  ]

  def test_parse_exception_dump

    error_message, backtrace = Honeybadger.parse_exception_dump ERROR

    assert_equal EXPECTED_MESSAGE, error_message
    assert_equal EXPECTED_BACKTRACE, backtrace
  end

  def test_notify_command_error

    expected_opts = {
        error_class: "/home/ubuntu/staging/bin/deliver_poste_messages returned 1",
        error_message: EXPECTED_MESSAGE,
        backtrace: EXPECTED_BACKTRACE,
        context: {
            stdout: 'captured stdout',
            stderr: ERROR,
            environment_variables: {}
        }
    }

    ENV.expects(:with_sensitive_values_redacted).returns({})
    Honeybadger.expects(:notify).with(expected_opts).once
    Honeybadger.notify_command_error COMMAND, 1, 'captured stdout', ERROR
  end

  def test_no_error
    ENV.expects(:with_sensitive_values_redacted).never
    Honeybadger.expects(:notify).never

    Honeybadger.notify_command_error COMMAND, 0, 'captured stdout', ''
  end

  def test_non_ruby_error
    error = 'ls: foo: No such file or directory'

    expected_opts = {
        error_class: "ls returned 1",
        error_message: error,
        backtrace: [error],
        context: {
            stdout: '',
            stderr: error,
            environment_variables: {}
        }
    }

    ENV.expects(:with_sensitive_values_redacted).returns({})
    Honeybadger.expects(:notify).with(expected_opts).once
    Honeybadger.notify_command_error 'ls', 1, '', error
  end

end
