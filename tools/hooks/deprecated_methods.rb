#!/usr/bin/env bundle exec ruby
REPO_DIR = File.expand_path('../../../', __FILE__)
require_relative "#{REPO_DIR}/lib/cdo/cdo_cli"
include CdoCli

DEPRECATED = [
  'FirehoseClient',
]

def detect_deprecated_methods
  Dir.chdir REPO_DIR do
    diff_output = `git diff --cached -- . ':(exclude)tools/hooks/deprecated_methods.rb' --unified=0`
    @added_lines = diff_output.each_line.select {|line| line.start_with?('+') && !line.start_with?('+++')}.map {|line| line[1..]}.join
  end

  DEPRECATED.each do |deprecated_method|
    @added_lines.each_line do |line|
      if line.match?(/^[^\n#\/]*#{Regexp.escape(deprecated_method)}/i)
        puts red <<-EOS
            Looks like you are using a deprecated method: #{deprecated_method}
            Please avoid using this method as it is planned to be removed in the near future.
        EOS
        raise "Commit blocked due to deprecated method usage: #{deprecated_method}."
      end
    end
  end
end

detect_deprecated_methods
