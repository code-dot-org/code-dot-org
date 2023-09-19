require_relative '../i18n_script_utils'

module I18n
  module Utils
    class SyncInBase
      class << self
        # Inits the instance method `#process`
        def process(&block)
          define_method :process do
            instance_exec(&block)
          end
        end

        def perform
          new.send(:execute)
        end
      end

      protected

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(title: self.class.name)
      end

      private

      # use `.process` to define the method
      def process
        raise NotImplementedError
      end

      def execute
        progress_bar.start

        process

        progress_bar.finish
      end
    end
  end
end
