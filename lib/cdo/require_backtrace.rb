# Debug utility to determine the source of a required Ruby file.
# Usage:
# require 'cdo/require_backtrace' if rack_env?(:development)
# RequireBacktrace.regex = /env(.rb)?$/
#
require 'active_support/core_ext/module/attribute_accessors'

module RequireBacktrace
  mattr_accessor :regex
  def require(*args)
    super(*args).tap do |required|
      if required && args.any? {|x| x.to_s.match regex}
        puts "Require #{args}", CDO.filter_backtrace(
          caller.grep_v(/active_support\/dependencies/).
            grep_v(/#{File.basename(__FILE__)}/)
        )
      end
    end
  end

  # Re-implement `require_relative` using `require` so it uses the same require filter,
  # and so the expanded path can be matched against.
  def require_relative(*args)
    require(File.expand_path(['..'].concat(args).join('/'), caller(1..1).first.split(':').first))
  end
end
include RequireBacktrace
