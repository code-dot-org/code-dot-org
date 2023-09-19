require_relative '../i18n_script_utils'

module I18n
  module Utils
    class SyncInBase
      class << self
        def perform
          new.send(:execute)
        end

        protected

        def process(&block)
          @process_block = block
        end

        private

        def process_block
          @process_block ||= proc {raise NotImplementedError}
        end
      end

      protected

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(title: self.class.name)
      end

      private

      def execute
        progress_bar.start

        instance_exec(&self.class.send(:process_block))

        progress_bar.finish
      end
    end
  end
end
