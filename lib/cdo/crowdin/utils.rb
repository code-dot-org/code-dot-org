require 'json'
require 'parallel'

module Crowdin
  # Crowdin's API is limited to 20 simultaneous requests. Limit our
  # implementation to half that, just for safety.
  # @see https://support.crowdin.com/api/api-integration-setup/#rate-limits
  MAX_THREADS = 10

  class Utils
    attr_reader :project
    attr_reader :changes_json
    attr_reader :etags_json
    attr_reader :locales_dir
    attr_reader :locale_subdir
    attr_reader :logger

    # @param project [Crowdin::Project]
    # @param options [Hash, nil]
    # @param options.changes_json [String, nil] path to file where files with
    #  changes will be written out in JSON format
    # @param options.etags_json [String, nil] path to file where etags will be
    #  written out in JSON format
    # @param options.locales_dir [String, nil] path to directory where changed
    #  files should be downloaded
    # @param options.locale_subdir [String, nil] name of directory within
    #  locale-specific directory to which files should be downloaded
    # @param options.logger [Logger, nil]
    def initialize(project, options={})
      @project = project
      @changes_json = options.fetch(:changes_json, "/tmp/#{project.id}_changes.json")
      @etags_json = options.fetch(:etags_json, "/tmp/#{project.id}_etags.json")
      @locales_dir = options.fetch(:locales_dir, "/tmp/locales")
      @locale_subdir = options.fetch(:locale_subdir, nil)
      @logger = options.fetch(:logger, Logger.new(STDOUT))
    end

    # Fetch from Crowdin a list of files changed since the last sync. Uses
    # etags sourced from the @etags_json file to define what we mean by "since
    # the last sync," and writes the results out to @changes_json.
    def fetch_changes
      etags = File.exist?(@etags_json) ? JSON.parse(File.read(@etags_json)) : {}

      # Clear out existing changes json if it exists
      File.write(@changes_json, '{}')
      changes = {}

      languages = @project.languages
      num_languages = languages.length
      languages.each_with_index do |language, i|
        language_code = language["code"]
        @logger.debug("#{language['name']} (#{language_code}): #{i}/#{num_languages}")
        @logger.info("~#{(i * 100 / num_languages).round(-1)}% complete (#{i}/#{num_languages})") if i > 0 && i % (num_languages / 5) == 0

        etags[language_code] ||= {}
        files = @project.list_files

        changed_files = Parallel.map(files, in_threads: MAX_THREADS) do |file|
          etag = etags[language_code].fetch(file, nil)
          response = @project.export_file(file, language_code, etag: etag, only_head: true)
          case response.code
          when 200
            [file, response.headers["etag"]]
          when 304
            nil
          else
            raise "cannot handle response code #{response.code}"
          end
        end.compact

        next if changed_files.empty?

        changes[language_code] = changed_files.to_h
        etags[language_code].merge!(changes[language_code])
        File.write(@etags_json, JSON.pretty_generate(etags))
        File.write(@changes_json, JSON.pretty_generate(changes))
      end
    end

    # Downloads all files referenced in @changes_json to @locales_dir
    def download_changed_files
      raise "No existing changes json at #{@changes_json}; please run fetch_changes first" unless File.exist?(@changes_json)
      changes = JSON.parse(File.read(@changes_json))
      @logger.info("#{changes.keys.length} languages have changes")
      @project.languages.each do |language|
        code = language["code"]
        name = language["name"]
        files = changes.fetch(code, nil)
        next unless files.present?
        filenames = files.keys

        # construct download directory; locale_subdir is optional, so compact
        locale_dir = File.join([@locales_dir, language["name"], @locale_subdir].compact)

        @logger.debug("#{name} (#{code}): #{filenames.length} files have changes")
        Parallel.each(filenames, in_threads: MAX_THREADS) do |file|
          response = @project.export_file(file, code)
          dest = File.join(locale_dir, file)
          FileUtils.mkdir_p(File.dirname(dest))
          # Make sure to specify the encoding; we expect to get quite a lot
          # of non-ASCII characters in this data
          File.open(dest, "w:#{response.body.encoding}") do |destfile|
            destfile.write(response.body)
          end
        end
      end
    end
  end
end
