# Configure Spring-specific settings.

# Monkey-patch spring-watcher-listen to not watch the root directory by default
# This avoids errors caused by recursively watching local symlinks in Listen >= 2.8
# refs:
# https://github.com/jonleighton/spring-watcher-listen/issues/8
# https://github.com/guard/listen/issues/339
# https://github.com/guard/listen/pull/273
require 'spring/watcher/listen'
module Spring
  module Watcher
    class Listen < Abstract
      def base_directories
        (files.map { |f| File.expand_path("#{f}/..") } +
          directories.to_a
        ).uniq.map { |path| Pathname.new(path) }
      end
    end
  end
end

# Note: Gemfile and deployment.rb will not be currently watched for changes
# because they are in the root directory.
Spring.watch %w(
  ../lib
  ../shared
)
