require 'puma'
require 'puma/plugin'
require 'active_support/core_ext/module/attribute_accessors'

# Puma plugin to log app stats every second.
module LogAppStats
  mattr_accessor(:stats_proc) {-> {true}}

  Puma::Plugin.create do
    def start(launcher)
      @launcher = launcher
      in_background(&method(:stats))
    end

    private

    def stats
      loop do
        if LogAppStats.stats_proc.call
          @launcher.events.log @launcher.stats
        end
      rescue StandardError => e
        @launcher.events.error "LogAppStats failed:\n  #{e}\n  #{e.backtrace.join("\n    ")}"
      ensure
        sleep 1
      end
    end
  end
end
