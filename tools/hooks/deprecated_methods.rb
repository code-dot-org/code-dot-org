#!/usr/bin/env bundle exec ruby
REPO_DIR = File.expand_path('../../../', __FILE__)
require_relative "#{REPO_DIR}/lib/cdo/cdo_cli"
include CdoCli

DEPRECATED = [
  'FirehoseClient',
]

def detect_deprecated_methods
  Dir.chdir REPO_DIR do
    @added_lines = `git diff --cached -- . ':(exclude)tools/hooks/deprecated_methods.rb' --unified=0 | grep '^\+'`
  end

  DEPRECATED.each do |deprecated_method|
    if @added_lines.match?(/^[^\n#]*#{Regexp.escape(deprecated_method)}/i)
      puts red <<-EOS
          Looks like you are using a deprecated method: #{deprecated_method}
          Please avoid using this method as it is planned to be removed in the near future.
      EOS
      raise "Commit blocked."
    end
  end
end

detect_deprecated_methods
