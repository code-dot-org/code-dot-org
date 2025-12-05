#!/usr/bin/env bundle exec ruby
REPO_DIR = File.expand_path('../../../', __FILE__)
require_relative "#{REPO_DIR}/lib/cdo/cdo_cli"
include CdoCli

# List of deprecated code patterns to detect
DEPRECATED = [
  'FirehoseClient',
]

def detect_deprecated_code
  Dir.chdir REPO_DIR do
    diff_output = `git diff --cached -- . ':(exclude)tools/hooks/deprecated_code.rb' --unified=0`

    # Only consider added lines (those starting with '+', excluding the diff metadata lines)
    @added_lines = diff_output.each_line.select {|line| line.start_with?('+') && !line.start_with?('+++')}.map {|line| line[1..]}.join
  end

  DEPRECATED.each do |deprecated_code|
    @added_lines.each_line do |line|
      # Detect usage of deprecated code, ignoring comments
      if line.match?(/^[^#\/]*\b#{Regexp.escape(deprecated_code)}\b/i)
        puts red <<-EOS
            Looks like you are using deprecated code: #{deprecated_code}
            Please avoid using this as it is planned to be removed in the near future.
        EOS
        raise "Commit blocked due to deprecated code usage: #{deprecated_code}."
      end
    end
  end
end

detect_deprecated_code
