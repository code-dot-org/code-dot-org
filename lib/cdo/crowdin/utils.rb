require 'json'
require 'parallel'

module Crowdin
  # Crowdin's API is limited to 20 simultaneous requests. Limit our
  # implementation to half that, just for safety.
  # @see https://support.crowdin.com/api/api-integration-setup/#rate-limits
  MAX_THREADS = 10

  class Utils
    attr_reader :project
    attr_reader :files_to_download_json
    attr_reader :files_to_sync_out_json
    attr_reader :etags_json
    attr_reader :locales_dir
    attr_reader :locale_subdir
    attr_reader :logger

    # @param project [Crowdin::Project]
    # @param options [Hash, nil]
    # @options options [String, nil] :files_to_download_json path to file where files
    #  should be downloaded will be written out in JSON format
    # @options options [String, nil] :files_to_sync_out_json path to file where files
    #  should be synced-out will be written out in JSON format
    # @options options [String, nil] :etags_json path to file where etags will be
    #  written out in JSON format
    # @options options [String, nil] :locales_dir path to directory where changed
    #  files should be downloaded
    # @options options [String, nil] :locale_subdir name of directory within
    #  locale-specific directory to which files should be downloaded
    # @options options [Logger, nil] :logger
    def initialize(project, options={})
      @project = project
      @etags_json = options.fetch(:etags_json, "/tmp/#{project.id}_etags.json")
      @files_to_download_json = options.fetch(:files_to_download_json, "/tmp/#{project.id}_files_to_download.json")
      @files_to_sync_out_json = options.fetch(:files_to_sync_out_json, "/tmp/#{project.id}_files_to_sync_out.json")
      @locales_dir = options.fetch(:locales_dir, "/tmp/locales")
      @locale_subdir = options.fetch(:locale_subdir, nil)
      @logger = options.fetch(:logger, Logger.new(STDOUT))
    end

    # Fetch from Crowdin a list of files changed since the last download. Uses
    # etags sourced from the @etags_json file to define what we mean by "since
    # the last download," and writes the results out to @files_to_download_json.
    def fetch_changes
      etags = File.exist?(@etags_json) ? JSON.parse(File.read(@etags_json)) : {}
      files_to_download = {}
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
        files_to_download[language_code] ||= {}
        files_to_download[language_code].merge! changed_files.to_h
      end

      File.write @files_to_download_json, JSON.pretty_generate(files_to_download)
    end

    # Downloads all files referenced in @files_to_download_json to @locales_dir
    # Merge the list of successfully downloaded files to @files_to_sync_out_json
    # to signal the sync-out step to process them.
    def download_changed_files
      raise "File not found #{@files_to_download_json}; please run fetch_changes first" unless File.exist?(@files_to_download_json)
      files_to_download = JSON.parse File.read(@files_to_download_json)
      @logger.info("#{files_to_download.keys.length} languages have changes")

      etags = File.exist?(@etags_json) ? JSON.parse(File.read(@etags_json)) : {}
      files_to_sync_out = File.exist?(@files_to_sync_out_json) ? JSON.parse(File.read(@files_to_sync_out_json)) : {}

      @project.languages.each do |language|
        code = language["code"]
        name = language["name"]
        files = files_to_download.fetch(code, nil)
        next unless files.present?
        filenames = files.keys

        # construct download directory; locale_subdir is optional, so compact
        locale_dir = File.join([@locales_dir, language["name"], @locale_subdir].compact)

        @logger.debug("#{name} (#{code}): #{filenames.length} files have changes")
        downloaded_files = Parallel.map(filenames, in_threads: MAX_THREADS) do |file|
          response = @project.export_file(file, code)
          dest = File.join(locale_dir, file)
          FileUtils.mkdir_p(File.dirname(dest))
          # Make sure to specify the encoding; we expect to get quite a lot
          # of non-ASCII characters in this data
          File.open(dest, "w:#{response.body.encoding}") do |destfile|
            destfile.write(response.body)
          end
          [file, response.headers["etag"]]
        end.to_h

        # Save incremental progress so we don't have to re-download everything
        # if the current run fails for any reason.
        # The order of saving progress is important for recovery purpose.
        # Since @files_to_sync_out_json depends on @files_to_download_json,
        # which in turn depends on @etags_json, @etags_json should be updated last.
        files_to_sync_out[code] ||= {}
        files_to_sync_out[code].merge! downloaded_files
        File.write @files_to_sync_out_json, JSON.pretty_generate(files_to_sync_out)

        files_to_download[code].delete_if {|file, _etag| downloaded_files.key? file}
        files_to_download.delete code if files_to_download[code].empty?
        File.write @files_to_download_json, JSON.pretty_generate(files_to_download)

        etags[code] ||= {}
        etags[code].merge! downloaded_files
        File.write @etags_json, JSON.pretty_generate(etags)
      end
      # Makes sure these files get written even if nothing was downloaded.
      File.write @files_to_sync_out_json, JSON.pretty_generate(files_to_sync_out)
      File.write @files_to_download_json, JSON.pretty_generate(files_to_download)
    end
  end
end
