require_relative '../i18n_script_utils'
require_relative '../metrics'

module I18n
  module Utils
    class SyncOutBase
      def self.parse_options
        I18nScriptUtils.parse_options
      end

      def self.perform(options = parse_options)
        sync_out = new(**options)

        resource_class = name[/^.*::(\w+::\w+)::SyncOut/, 1] || name

        I18n::Metrics.report_runtime(resource_class, 'sync-out') do
          sync_out.send(:perform)
        end
      end

      attr_reader :options

      protected def initialize(**options)
        @options = options.freeze
      end

      protected def process(_language)
        raise NotImplementedError
      end

      # List of supported CDO Languages to sync-out
      #
      # @return [Array<CdoLanguage>] supported CDO languages except the source language
      protected def languages
        @languages ||= I18nScriptUtils.cdo_languages.select do |cdo_language|
          cdo_language[:locale_s] != I18nScriptUtils::SOURCE_LOCALE
        end
      end

      protected def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(title: self.class.name, total: languages.size)
      end

      protected def mutex
        @mutex ||= Thread::Mutex.new
      end

      private def perform
        progress_bar.start

        I18nScriptUtils.process_in_threads(languages) do |language|
          process(language)
        ensure
          I18nScriptUtils.remove_empty_dir I18nScriptUtils.crowdin_locale_dir(language[:locale_s])

          mutex.synchronize {progress_bar.increment}
        end

        progress_bar.finish
      end
    end
  end
end
