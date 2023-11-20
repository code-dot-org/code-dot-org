require_relative '../i18n_script_utils'
require_relative '../metrics'

module I18n
  module Utils
    class SyncOutBase
      def self.perform
        resource_class = name[/^.*::(\w+::\w+)::SyncOut/, 1] || name

        I18n::Metrics.report_runtime(resource_class, 'sync-out') do
          new.send(:perform)
        end
      end

      protected

      def process(_language)
        raise NotImplementedError
      end

      def languages
        @languages ||= PegasusLanguages.all
      end

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(title: self.class.name, total: languages.size)
      end

      def mutex
        @mutex ||= Thread::Mutex.new
      end

      private

      def perform
        progress_bar.start

        I18nScriptUtils.process_in_threads(languages) do |language|
          process(language)
        ensure
          I18nScriptUtils.remove_empty_dir I18nScriptUtils.locale_dir(language[:crowdin_name_s])

          mutex.synchronize {progress_bar.increment}
        end

        progress_bar.finish
      end
    end
  end
end
