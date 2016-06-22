require 'honeybadger'
require_relative 'env'

# Honeybadger extensions for command error logging
module Honeybadger
  # notify_command_error - log an error from an executed command to honeybadger.
  #   Attempts to parse the underlying exception from stderr,
  #   and logs captured stdout and environment variables (with sensitive values hidden) in the context.
  #
  # command - the command that was executed
  # status - exitstatus from the command (non-zero for failure)
  # stdout - captured stdout from the command
  # stderr - captured stderr from the command
  def self.notify_command_error(command, status, stdout, stderr)
    return if stderr.to_s.empty? && status == 0

    error_message, backtrace = parse_exception_dump stderr

    # use entire error when unable to parse error message
    error_message = stderr if error_message.to_s.empty?

    opts = {
        error_class: "#{command} returned #{status}",
        error_message: error_message,
        backtrace: backtrace,
        context: {
            stdout: stdout,
            stderr: stderr, # include full stderr in case honeybadger truncates the error_message/backtrace thing
            environment_variables: ENV.with_sensitive_values_redacted
        }
    }

    Honeybadger.notify(opts)
  end

  # parse_exception_from_stderr - attempts to parse an exception message and stacktrace from a stderr capture
  #
  # Returns [error_message, backtrace]
  def self.parse_exception_dump(error)
    return if error.to_s.empty?

    # Unhandled Ruby exceptions are dumped to STDERR in the following format:
    #   file:number:in `method': message
    #     from file:number:in `method'
    #     from ...
    #
    # Honeybadger::Backtrace::Line fails to parse the first line due to the message
    #   See regex here: https://github.com/honeybadger-io/honeybadger-ruby/blob/2072d85532b7effd8032707faa01b5ac83d9f36d/lib/honeybadger/backtrace.rb#L9
    # The following addition will parse the message from the end of the first line
    corrected_input_format = Regexp.new(Honeybadger::Backtrace::Line::INPUT_FORMAT.source.sub(/\$$/,'(?:: (.+))?$')).freeze

    error_lines = error.lines.map &:strip
    _, _file, _number, _method, error_message = error_lines[0].match(corrected_input_format).to_a
    error_lines[0].chomp!(": #{error_message}")

    [error_message, error_lines]
  end
end
