require 'json'
require 'parallel'
require 'httparty'

module Crowdin
  # Crowdin's API is limited to 20 simultaneous requests. Limit our
  # implementation just for safety.
  # @see https://support.crowdin.com/api/api-integration-setup/#rate-limits
  MAX_THREADS = 8

  class LegacyUtils
    attr_reader(
      :project,
      :files_to_download_json,
      :files_to_sync_out_json,
      :etags_json,
      :locales_dir,
      :locale_subdir,
      :logger
    )

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
    def initialize(project, options = {})
      @project = project
      @etags_json = options.fetch(:etags_json, "/tmp/#{project.id}_etags.json")
      @files_to_download_json = options.fetch(:files_to_download_json, "/tmp/#{project.id}_files_to_download.json")
      @files_to_sync_out_json = options.fetch(:files_to_sync_out_json, "/tmp/#{project.id}_files_to_sync_out.json")
      @locales_dir = options.fetch(:locales_dir, "/tmp/locales")
      @locale_subdir = options.fetch(:locale_subdir, nil)
      @logger = options.fetch(:logger, Logger.new(STDOUT))
    end

    # Fetch from Crowdin a list of all of the project's files. Uses
    # etags sourced from the @etags_json file to define what we mean by "changed",
    # and updates the etags by writing the results out to @etags_json.
    def download_changed_files
      etags = File.exist?(@etags_json) ? JSON.parse(File.read(@etags_json)) : {}
      # Initialize @files_to_sync_out file if it doesn't exist yet.
      # It could already exist if multiple sync-down's occurred since the last sync-out.
      File.write @files_to_sync_out_json, JSON.pretty_generate({}) unless File.exist?(@files_to_sync_out_json)
      files_to_sync_out = JSON.parse(File.read(@files_to_sync_out_json))

      files = @project.list_files
      languages = @project.languages
      num_languages = languages.length

      languages.each_with_index do |language, i|
        language_code = language["id"]
        @logger.debug("#{language['name']} (#{language_code}): #{i}/#{num_languages}")
        @logger.info("~#{(i * 100 / num_languages).round(-1)}% complete (#{i}/#{num_languages})") if i > 0 && i % [num_languages / 5, 1].max == 0

        etags[language_code] ||= {}
        # construct download directory; locale_subdir is optional, so compact
        locale_dir = File.join([@locales_dir, language["name"], @locale_subdir].compact)

        downloaded_files = Parallel.map(files, in_threads: MAX_THREADS) do |file|
          file_id = file['id']
          file_path = file['path']
          etag = etags[language_code].fetch(file_path, nil)
          response = @project.export_file(file_id, language_code, etag: etag)
          case response.code
          when 200
            dest = File.join(locale_dir, file_path)
            download_file(response["data"]["url"], dest)

            [file_path, response["data"]["etag"]]
          when 304
            nil
          else
            raise "cannot handle response code #{response.code}"
          end
        end.compact.to_h

        next if downloaded_files.empty?
        # Save incremental progress so we don't have to re-download everything
        # if the current run fails for any reason.
        # The order of saving progress is important for recovery purpose.
        # Since @files_to_sync_out_json depends on @etags_json, @etags_json
        # should be updated last.
        files_to_sync_out[language_code] ||= {}
        files_to_sync_out[language_code].merge! downloaded_files
        File.write @files_to_sync_out_json, JSON.pretty_generate(files_to_sync_out)

        etags[language_code] ||= {}
        etags[language_code].merge! downloaded_files
        File.write @etags_json, JSON.pretty_generate(etags)
      end
    end

    def download_file(download_url, dest, attempts: 3)
      response = HTTParty.get(download_url)
      raise AWSError if response.code != 200

      FileUtils.mkdir_p(File.dirname(dest))
      # Make sure to specify the encoding; we expect to get quite a lot
      # of non-ASCII characters in this data
      File.open(dest, "w:#{response.body.encoding}") do |destfile|
        destfile.write(response.body)
      end
    rescue Net::ReadTimeout, Net::OpenTimeout, AWSError => exception
      # Only attempting retries on request errors. Surfacing errors during write.
      warn "download_file(#{dest})#{response.present? ? " error code: #{response.code}" : ''} error: #{exception}"
      raise if attempts <= 1
      download_file(download_url, dest, attempts: attempts - 1)
    end
  end

  class AWSError < StandardError
    def initialize(msg = "AWS Error")
      super
    end
  end
end
