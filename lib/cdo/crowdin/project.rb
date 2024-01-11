require 'httparty'
require_relative 'client_extentions'

module Crowdin
  # This class represents a single project hosted on Crowdin, and provides
  # access to data on that project via Crowdin's API
  class Project
    include HTTParty

    attr_reader :id

    # @param project_identifier [String]
    # @param api_token [String]
    # @see https://crowdin.com/project/codeorg/integrations/api for an example of
    #  how to retrieve these values for the "code.org" project
    def initialize(project_identifier, api_token)
      @id = project_identifier
      @crowdin_client = Crowdin::Client.new do |config|
        config.api_token = api_token
        config.project_id = @id
      end
      # For more specific requests outside of the crowdin-api gem
      self.class.base_uri("https://api.crowdin.com/api/v2")
      self.class.headers(
        {
          "Authorization" => "Bearer #{api_token}",
          "Content-Type" => "application/json"
        }
      )
    end

    # @param file_id [String] name of file (within crowdin) to be downloaded
    # @param language [String] crowdin language code
    # @param etag [String, nil] the last file version tag returned by crowdin
    #  for this file. If no changes have occurred since the provided etag was
    #  generated, crowdin will return a 304 (Not Modified) status instead of
    #  downloading the file. See the Build Project File Translation Crowdin
    #  documentation for details
    # @param attempts [Number, nil] how many times we should retry the download
    #  if it fails
    # @see https://developer.crowdin.com/api/v2/#operation/api.projects.translations.builds.files.post
    def export_file(file_id, language, etag: nil, attempts: 3)
      options = {
        body: {
          targetLanguageId: language
        }.to_json
      }

      unless etag.nil?
        options[:headers] = {
          "If-None-Match" => etag
        }
      end

      response = self.class.post(
        "/projects/#{@crowdin_client.config.project_id}/translations/builds/files/#{file_id}",
        options
      )
      raise CrowdinRateLimitError if response.code == 429
      raise CrowdinInternalServerError if response.code == 500
      raise CrowdinServiceUnavailableError if response.code == 503

      response
    rescue Net::ReadTimeout, Net::OpenTimeout, CrowdinRateLimitError, CrowdinInternalServerError, CrowdinServiceUnavailableError => exception
      # Handle a timeout by simply retrying. We default to three attempts before
      # giving up; if this doesn't work out, other things we could consider:
      #
      #   - increasing the default number of attempts
      #   - increasing the number of attempts for certain high-failure-rate calls
      #   - increasing the timeout, either globally or for this specific call
      warn "Crowdin.export_file(#{file_id}) error: #{exception}"
      sleep(3) if response&.code == 429
      raise if attempts <= 1
      export_file(file_id, language, etag: etag, attempts: attempts - 1)
    end

    # Retrieve all languages currently enabled in the crowdin project. Each
    # language is a hash containing the language name and id, as well as
    # other internal crowdin values.
    # @example [{"name"=>"Norwegian", "id"=>"no", ...]
    # @return [Array<Hash>]
    def languages
      # cache the result; we end up calling this method quite a lot since it's
      # the source of both our lists of files and of languages, and it also
      # shouldn't ever change mid-sync.

      @languages ||= list_languages
    end

    def list_languages
      result = @crowdin_client.get_project(@id)
      result['data']['targetLanguages']
    end

    # Retrieve all files currently uploaded to the crowdin project.
    # @example [{"id"=>169076, "path"=>"/pegasus/mobile.yml"}, {"id"=>169080, "path"=>"/blockly-core/core.json"}, ...]
    # @return [Array<Hash>]
    def list_files
      query = {
        limit: Crowdin::Client::MAX_ITEMS_COUNT,
        offset: 0
      }

      results = @crowdin_client.request_loop(query) do
        @crowdin_client.list_files(query)
      end

      results.map! do |file|
        {
          "id" => file["data"]["id"],
          "path" => file["data"]["path"]
        }
      end
    end
  end
end
