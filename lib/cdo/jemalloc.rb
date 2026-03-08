require 'open3'

module Cdo
  module Jemalloc
    JEMALLOC_SONAME = 'libjemalloc.so.2'.freeze

    def self.jemalloc_env
      return '' unless CDO.dashboard_use_jemalloc
      raise 'jemalloc is only supported on Linux' unless RUBY_PLATFORM.include?('linux')
      raise 'jemalloc was not found in `ldconfig -p`' unless jemalloc_installed?

      "LD_PRELOAD=#{JEMALLOC_SONAME} "
    end

    def self.jemalloc_installed?
      output, status = Open3.capture2('ldconfig', '-p')
      status.success? && output.include?(JEMALLOC_SONAME)
    end
  end
end
