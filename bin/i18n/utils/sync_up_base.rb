require_relative '../i18n_script_utils'
require_relative '../metrics'
require_relative '../utils/crowdin_client'

module I18n
  module Utils
    class SyncUpBase
      Config = Struct.new :crowdin_project, :source_paths, keyword_init: true

      MAIN_CROWDIN_PROJECT = 'codeorg'.freeze

      def self.config
        @config ||= Config.new(
          crowdin_project: MAIN_CROWDIN_PROJECT,
          source_paths: [],
        )
      end

      def self.perform
        i18n_resource_name = name[/^.*::(\w+::\w+)::SyncUp/, 1] || name

        I18n::Metrics.report_runtime(i18n_resource_name, 'sync-up') do
          new.send(:perform)
        end
      end

      protected

      def perform
        progress_bar.start

        crowdin_client # Initialize `@crowdin_client` outside threads to avoid multiple instance creations

        I18nScriptUtils.process_in_threads(source_files, in_threads: PARALLEL_PROCESSES) do |source_file_path|
          crowdin_client.upload_source_file(source_file_path)
        ensure
          mutex.synchronize {progress_bar.increment}
        end

        progress_bar.finish
      end

      private

      PROGRESS_BAR_FORMAT = '%t: |%W| %c/%C %a'.freeze
      PARALLEL_PROCESSES = 20 # https://developer.crowdin.com/api/v2/#section/Introduction/Rate-Limits

      def config
        self.class.config
      end

      def testing?
        CDO.rack_env?(:development)
      end

      def crowdin_project
        @crowdin_project ||= testing? ? CDO.crowdin_project_test_mapping[config.crowdin_project] : config.crowdin_project
      end

      def crowdin_client
        @crowdin_client ||= I18n::Utils::CrowdinClient.new(crowdin_project)
      end

      def source_files
        @source_files ||= config.source_paths.flat_map do |source_path|
          Dir.glob(source_path).select {|source_file_path| File.file?(source_file_path)}
        end.uniq
      end

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(
          title: self.class.name,
          total: source_files.size,
          format: PROGRESS_BAR_FORMAT,
        )
      end

      def mutex
        @mutex ||= Thread::Mutex.new
      end
    end
  end
end
