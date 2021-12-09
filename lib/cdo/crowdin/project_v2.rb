require 'crowdin-api'

module Crowdin
  # This class represents a single project hosted on Crowdin, and provides
  # access to data on that project via Crowdin's API
  class ProjectV2
    attr_reader :id

    # @param project_id [String]
    # @param api_key [String]
    # @see https://crowdin.com/project/codeorg/integrations/api
    #  and https://crowdin.com/settings#api-key for an example of
    #  how to retrieve these values for the "code.org" project
    def initialize(project_id, api_token)
      @id = project_id
      @client = Crowdin::Client.new do |config|
        config.api_token = api_token
        config.project_id = project_id
        #config.enable_logger = true
      end
    end

    # @see https://support.crowdin.com/api/v2/#operation/api.projects.get
    def project_info
      # cache the result; we end up calling this method quite a lot since it's
      # the source of both our lists of files and of languages, and it also
      # shouldn't ever change mid-sync.
      @info ||= @client.get_project(@id)
    end

    ### TODO ###
    # @param file [String] name of file (within crowdin) to be downloaded
    # @param language [String] crowdin language code
    # @param etag [String, nil] the last file version tag returned by crowdin
    #  for this file. If no changes have occurred since the provided etag was
    #  generated, crowdin will return a 304 (Not Modified) status instead of
    #  downloading the file. See the export-file Crowdin documentation for
    #  details
    # @param attempts [Number, nil] how many times we should retry the download
    #  if it fails
    # @param only_head [Boolean, nil] whether to make a HEAD request rather
    #  than a full GET request. Defaults to false.
    # @see https://support.crowdin.com/api/export-file/
    def export_file(file, language, etag: nil, attempts: 3, only_head: false)
      options = {
        query: {
          file: file,
          language: language
        }
      }

      unless etag.nil?
        options[:headers] = {
          "If-None-Match" => etag
        }
      end

      only_head ? self.class.head("/export-file", options) : self.class.get("/export-file", options)

    rescue Net::ReadTimeout, Net::OpenTimeout => error
      # Handle a timeout by simply retrying. We default to three attempts before
      # giving up; if this doesn't work out, other things we could consider:
      #
      #   - increasing the default number of attempts
      #   - increasing the number of attempts for certain high-failure-rate calls
      #   - increasing the timeout, either globally or for this specific call
      STDERR.puts "Crowdin.export_file(#{file}) timed out: #{error}"
      raise if attempts <= 1
      export_file(file, language, etag: etag, attempts: attempts - 1, only_head: only_head)
    end

    # Retrieve all languages currently enabled in the crowdin project. Each
    # language is a hash containing the language name and code, as well as
    # other internal crowdin values.
    # @example [{"name"=>"Norwegian", "id"=>"no", "locale"=>"nn-NO", ...]
    # @return [Array<Hash>]
    def languages
      @languages ||= project_info["data"]["targetLanguages"]
    end

    # Retrieve all files currently uploaded to the crowdin project.
    # @example ["/dashboard/base.yml", "/dashboard/data.yml", ...]
    # @return [Array<String>]
    # @see https://support.crowdin.com/api/v2/#operation/api.projects.files.getMany
    def list_files
      files = []
      offset = 0
      limit = 500
      results_length = limit
      while results_length == limit
        result = @client.list_files({limit: limit, offset: offset}, @id)["data"]
        results_length = result.length
        files.push(*result.map {|file| file["data"]["path"]})
        offset += results_length
      end
      files
    end

    private

    ### TODO ###
    # Iterate through files as returned by crowdin. Crowdin returns files in a
    # nested format, where each file is a "node", and directories are nodes
    # that can contain other nodes. This helper simply knows how to traverse
    # that simulated directory structure, and will yield each file in turn
    # along with its directory.
    # @param files [Array<Hash>]
    # @param path [String, nil]
    # @yield [name, path] the name of a file and the full path to the directory
    #   in which it can be found.
    def each_file(files, path="")
      files = [files] unless files.is_a? Array
      files.each do |file|
        case file["node_type"]
        when "directory"
          subfiles = file["files"]["item"]
          subpath = File.join(path, file["name"])
          each_file(subfiles, subpath) {|f, p| yield f, p}
        when "file"
          yield file, path
        else
          raise "Cannot process file of type #{file['node_type']}"
        end
      end
    end
  end
end
