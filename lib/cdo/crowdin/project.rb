require 'httparty'

module Crowdin
  # This class represents a single project hosted on Crowdin, and provides
  # access to data on that project via Crowdin's API
  class Project
    include HTTParty

    attr_reader :id

    # @param [String] project_id
    # @param [String] api_key
    # @see https://crowdin.com/project/codeorg/settings#api for an example of
    #      how to retrieve these values for the "code.org" project
    def initialize(project_id, api_key)
      @id = project_id
      self.class.base_uri("https://api.crowdin.com/api/project/#{project_id}")
      self.class.default_params key: api_key
    end

    # https://support.crowdin.com/api/info/
    def project_info
      self.class.post("/info")
    end

    # https://support.crowdin.com/api/export-file/
    def export_file(file, language, etag=nil, attempts=3)
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
      self.class.get("/export-file", options)
    rescue Net::ReadTimeout => error
      # Handle a timeout by simply retrying. We default to three attempts before
      # giving up; if this doesn't work out, other things we could consider:
      #
      #   - increasing the default number of attempts
      #   - increasing the number of attempts for certain high-failure-rate calls
      #   - increasing the timeout, either globally or for this specific call
      STDERR.puts "Crowdin.export_file(#{file}) timed out: #{error}"
      raise if attempts <= 1
      export_file(file, language, etag, attempts - 1)
    end

    def languages
      project_info["info"]["languages"]["item"]
    end

    def list_files
      files = project_info["info"]["files"]["item"]
      results = []
      each_file(files) do |file, path|
        results << File.join(path, file["name"])
      end
      results
    end

    private

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
