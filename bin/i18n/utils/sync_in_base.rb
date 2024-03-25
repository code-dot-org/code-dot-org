require_relative '../i18n_script_utils'
require_relative '../metrics'

module I18n
  module Utils
    class SyncInBase
      def self.perform
        resource_class = name[/^.*::(\w+::\w+)::SyncIn/, 1] || name

        I18n::Metrics.report_runtime(resource_class, 'sync-in') do
          new.send(:perform)
        end
      end

      protected

      def process
        raise NotImplementedError
      end

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(title: self.class.name)
      end

      def mutex
        @mutex ||= Thread::Mutex.new
      end

      private

      def perform
        progress_bar.start

        process

        progress_bar.finish
      end
    end
  end
end
