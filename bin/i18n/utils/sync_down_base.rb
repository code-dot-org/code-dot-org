require 'optparse'
require 'parallel'

require_relative '../i18n_script_utils'
require_relative '../metrics'
require_relative '../utils/crowdin_client'

module I18n
  module Utils
    class SyncDownBase
      Config = Struct.new :crowdin_project, :download_paths, keyword_init: true
      DownloadPath = Struct.new :crowdin_src, :dest_subdir, keyword_init: true
      Options = Struct.new :testing, keyword_init: true do
        def initialize(testing: I18nScriptUtils::TESTING_BY_DEFAULT, **) super end
      end

      def self.config
        @config ||= Config.new(
          crowdin_project: 'codeorg',
          download_paths: [],
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

      # Sync-down an i18n resource.
      #
      # @param [Hash] options
      # @option options [true, false] :testing Whether to run in testing mode
      # @return [void]
      def self.perform(options = parse_options)
        sync_down = new(**options)

        I18n::Metrics.report_runtime(sync_down.send(:resource_name), 'sync-down') do
          sync_down.send(:perform)
        end
      end

      protected

      attr_reader :config, :options

      def initialize(**options)
        @config = self.class.config.freeze
        @options = Options.new(**options).freeze
      end

      def perform
        etags_path = CDO.dir('bin/i18n/crowdin/etags', "#{resource_name.underscore}.#{crowdin_project}.json")
        etags = File.file?(etags_path) ? JSON.load_file(etags_path) : {}

        config.download_paths.uniq.each do |download_path|
          source_files = source_files(download_path[:crowdin_src])

          progress_bar = I18nScriptUtils.create_progress_bar(
            title: "#{self.class.name}[#{File.join(crowdin_project, download_path[:crowdin_src])}]",
            total: cdo_languages.size * source_files.size,
            format: '%t: |%W| %c/%C %a',
          )

          mutex = Thread::Mutex.new
          Parallel.each(cdo_languages, in_threads: I18n::Utils::CrowdinClient::MAX_CONCURRENT_REQUESTS) do |language|
            locale_etags = etags[language[:locale_s]] ||= {}

            source_files.each do |source_file|
              dest_path = I18nScriptUtils.crowdin_locale_dir(
                language[:locale_s], download_path[:dest_subdir], source_file['path']
              )

              translation_etag = crowdin_client.download_translation(
                source_file['id'], language[:crowdin_code_s], dest_path, etag: locale_etags[source_file['path']]
              )

              locale_etags[source_file['path']] = translation_etag
            ensure
              mutex.synchronize {progress_bar.increment}
            end
          end
        end

        I18nScriptUtils.write_json_file(etags_path, etags)
      end

      private

      def resource_name
        @resource_name ||= self.class.name[/^.*::(\w+::\w+)::SyncDown/, 1] || self.class.name
      end

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
        @crowdin_client ||= I18n::Utils::CrowdinClient.new(project: crowdin_project)
      end

      # CDO languages supported by the Crowdin project
      def cdo_languages
        @cdo_languages ||= begin
          available_lang_ids = crowdin_client.get_project['targetLanguages'].map {|lang| lang['id']}
          I18nScriptUtils.cdo_languages.select {|lang| available_lang_ids.include?(lang[:crowdin_code_s])}
        end
      end

      def source_files(crowdin_src)
        if crowdin_src.nil? || File.extname(crowdin_src).empty?
          crowdin_client.list_source_files(crowdin_src)
        else
          [crowdin_client.get_source_file(crowdin_src)]
        end
      end
    end
  end
end
