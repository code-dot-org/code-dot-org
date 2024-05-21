require 'optparse'

require_relative '../i18n_script_utils'
require_relative '../metrics'
require_relative '../utils/crowdin_client'

module I18n
  module Utils
    class SyncUpBase
      Config = Struct.new :crowdin_project, :base_path, :source_paths, :ignore_paths, keyword_init: true

      def self.config
        @config ||= Config.new(
          crowdin_project: 'codeorg',
          base_path: CDO.dir(I18N_SOURCE_DIR),
          source_paths: [],
          ignore_paths: [],
        )
      end

      def self.parse_options
        I18nScriptUtils.parse_options
      end

      # Sync-up an i18n resource.
      #
      # @param [Hash] options
      # @option options [true, false] :testing Whether to run in testing mode
      # @return [void]
      def self.perform(options = parse_options)
        sync_up = new(**options)

        i18n_resource_name = name[/^.*::(\w+::\w+)::SyncUp/, 1] || name

        I18n::Metrics.report_runtime(i18n_resource_name, 'sync-up') do
          sync_up.send(:perform)
        end
      end

      attr_reader :config, :options

      protected def initialize(**options)
        @config = self.class.config.freeze
        @options = options.freeze
      end

      protected def perform
        progress_bar.start

        mutex = Thread::Mutex.new
        Parallel.each(source_files, in_threads: I18n::Utils::CrowdinClient::MAX_CONCURRENT_REQUESTS) do |source_file_path|
          crowdin_file_path = File.join File::SEPARATOR, source_file_path.delete_prefix(config.base_path)
          crowdin_dir_path = File.dirname(crowdin_file_path)

          crowdin_client.upload_source_file(source_file_path, crowdin_dir_path)
        ensure
          mutex.synchronize do
            progress_bar.increment

            # Limits the number of requests to 20 per second to avoid hitting Crowdin's rate limit
            sleep(1) if progress_bar.progress % I18n::Utils::CrowdinClient::MAX_CONCURRENT_REQUESTS == 0
          end
        end

        progress_bar.finish
      end

      private def crowdin_project
        @crowdin_project ||=
          if options[:testing]
            # When testing, use a set of test Crowdin projects that mirrors our regular set of projects.
            CDO.crowdin_project_test_mapping[config.crowdin_project]
          else
            config.crowdin_project
          end
      end

      private def crowdin_client
        @crowdin_client ||= I18n::Utils::CrowdinClient.new(project: crowdin_project)
      end

      private def source_files
        @source_files ||= begin
          source_files = config.source_paths.flat_map do |source_path|
            Dir.glob(File.expand_path(source_path, config.base_path)).select {|source_file_path| File.file?(source_file_path)}
          end.uniq

          ignore_files = config.ignore_paths.flat_map do |ignore_path|
            Dir.glob(File.expand_path(ignore_path, config.base_path)).select {|source_file_path| File.file?(source_file_path)}
          end.uniq

          source_files - ignore_files
        end
      end

      private def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(
          title: "#{self.class.name}[#{crowdin_project}]",
          total: source_files.size,
          format: '%t: |%W| %c/%C %a',
        )
      end
    end
  end
end
