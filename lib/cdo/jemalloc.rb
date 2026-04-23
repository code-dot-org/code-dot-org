require 'open3'

module Cdo
  module Jemalloc
    JEMALLOC_SONAME = 'libjemalloc.so.2'.freeze

    # ENV=blah string to run with jemalloc
    def self.jemalloc_env_if_enabled
      return '' unless CDO.dashboard_use_jemalloc
      raise 'jemalloc is only supported on Linux' unless RUBY_PLATFORM.include?('linux')
      raise 'jemalloc was not found in `ldconfig -p`' unless installed?

      puts "jemalloc_env_if_enabled(): returning LD_PRELOAD=#{JEMALLOC_SONAME}"
      "LD_PRELOAD=#{JEMALLOC_SONAME} "
    end

    # Can ldconfig find jemalloc?
    def self.installed?
      output, status = Open3.capture2('ldconfig', '-p')
      status.success? && output.include?(JEMALLOC_SONAME)
    end

    # Are we currently running with jemalloc live?
    def self.preloaded?
      return false unless RUBY_PLATFORM.include?('linux')
      maps = File.exist?('/proc/self/maps') ? File.read('/proc/self/maps') : ''
      maps.include?('libjemalloc')
    end

    def self.log_jemalloc_status
      return unless CDO.dashboard_use_jemalloc

      if preloaded?
        message = 'USING JEMALLOC'
        puts message
        Rails.logger.info(message)
      else
        message = 'ERROR: NOT USING JEMALLOC. CDO.dashboard_use_jemalloc was true, but jemalloc was NOT found preloaded in /proc/self/maps'
        puts message
        Rails.logger.error(message)
      end
    end
  end
end
