require 'optparse'

require_relative '../i18n_script_utils'
require_relative '../metrics'
require_relative '../utils/crowdin_client'

module I18n
  module Utils
    class SyncUpBase
      Config = Struct.new :crowdin_project, :source_paths, :ignore_paths, keyword_init: true

      MAIN_CROWDIN_PROJECT = 'codeorg'.freeze

      def self.config
        @config ||= Config.new(
          crowdin_project: MAIN_CROWDIN_PROJECT,
          source_paths: [],
          ignore_paths: [],
        )
      end

      def self.parse_options
        options = Options.new

        OptionParser.new do |opts|
          opts.on('-t', '--testing', 'Run in testing mode') do
            options[:testing] = true
          end
        end.parse!

        options.to_h
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

      protected

      Options = Struct.new :testing, keyword_init: true do
        def initialize(testing: I18nScriptUtils::TESTING_BY_DEFAULT, **) super end
      end

      attr_reader :config, :options

      def initialize(**options)
        @config = self.class.config.freeze
        @options = Options.new(**options).freeze
      end

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

      def crowdin_project
        @crowdin_project ||=
          if options.testing
            # When testing, use a set of test Crowdin projects that mirrors our regular set of projects.
            CDO.crowdin_project_test_mapping[config.crowdin_project]
          else
            config.crowdin_project
          end
      end

      def crowdin_client
        @crowdin_client ||= I18n::Utils::CrowdinClient.new(crowdin_project)
      end

      def source_files
        @source_files ||= begin
          source_files = config.source_paths.flat_map do |source_path|
            Dir.glob(source_path).select {|source_file_path| File.file?(source_file_path)}
          end.uniq

          ignore_files = config.ignore_paths.flat_map do |ignore_path|
            Dir.glob(ignore_path).select {|source_file_path| File.file?(source_file_path)}
          end.uniq

          source_files - ignore_files
        end
      end

      def progress_bar
        @progress_bar ||= I18nScriptUtils.create_progress_bar(
          title: "#{self.class.name}[#{crowdin_project}]",
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
