require_relative '../i18n_script_utils'

module I18n
  module Utils
    class SyncOutBase
      class << self
        # Inits the instance method `#process` with the arg `language`
        def process(&block)
          define_method :process do |language|
            instance_exec language, &block
          end
        end

        def perform
          new.send(:execute)
        end
      end

      protected

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

      # use `.process` to define the method
      def process(*)
        raise NotImplementedError
      end

      def execute
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
