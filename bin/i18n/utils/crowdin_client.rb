require 'crowdin-api'

require_relative '../i18n_script_utils'

module I18n
  module Utils
    class CrowdinClient
      RequestError = Class.new(StandardError)

      MAX_ITEMS_COUNT = Crowdin::Web::FetchAllExtensions::MAX_ITEMS_COUNT_PER_REQUEST.freeze
      MAX_CONCURRENT_REQUESTS = 20 # https://developer.crowdin.com/api/v2/#section/Introduction/Rate-Limits
      REQUEST_RETRY_ATTEMPTS = 2 # Number of retries for a failed request
      REQUEST_RETRY_DELAY = 2 # Number of seconds to wait before retrying a failed request
      RETRIABLE_ERRORS = [
        '408 Request Timeout',
        '429 Too Many Requests',
        '500 Internal Server Error',
        '503 Service Unavailable',
      ].freeze # Request errors to retry

      # @param project [String] the Crowdin project name, one of the keys of PROJECT_IDS
      def initialize(project:)
        raise ArgumentError, 'project is invalid' unless CDO.crowdin_project_ids[project]

        @project = project

        @client = ::Crowdin::Client.new do |config|
          config.api_token = I18nScriptUtils.crowdin_creds['api_token']
          config.project_id = CDO.crowdin_project_ids[project]
        end
      end

      # Creates the Crowdin directory for the given i18n source directory path
      # https://developer.crowdin.com/api/v2/#operation/api.projects.directories.post
      #
      # @param crowdin_dir_path [String] the absolute Crowdin source directory path, e.g "/course_content/2017"
      # return [Hash, nil] the created Crowdin source directory data
      def add_source_directory(crowdin_dir_path)
        crowdin_dir_name = crowdin_source_name(crowdin_dir_path)
        return if crowdin_dir_name.empty?

        crowdin_parent_dir_path = File.dirname(crowdin_dir_path)
        crowdin_parent_dir_id = source_directory(crowdin_parent_dir_path)&.dig('id')

        request(:add_directory, directoryId: crowdin_parent_dir_id, name: crowdin_dir_name)['data']
      end

      # Retrieves the Crowdin source directory data of the given i18n source directory path
      # https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      #
      # @param crowdin_dir_path [String] the absolute Crowdin source directory path, e.g "/course_content/2017"
      # @return [Hash, nil] the Crowdin source directory data
      def get_source_directory(crowdin_dir_path)
        crowdin_dir_name = crowdin_source_name(crowdin_dir_path)
        return if crowdin_dir_name.empty?

        request_offset = 0
        crowdin_directory = nil

        loop do
          crowdin_dirs = request(:list_directories, filter: crowdin_dir_name, offset: request_offset, limit: MAX_ITEMS_COUNT)['data']

          crowdin_directory = crowdin_dirs.find {|crowdin_dir| crowdin_dir.dig('data', 'path') == crowdin_dir_path}

          break if crowdin_directory || crowdin_dirs.size < MAX_ITEMS_COUNT

          request_offset += MAX_ITEMS_COUNT
        end

        crowdin_directory&.dig('data')
      end

      # Retrieves the Crowdin source file data of the given i18n source file path
      # https://developer.crowdin.com/api/v2/#operation/api.projects.files.getMany
      #
      # @param crowdin_file_path [String] the Crowdin source file path, e.g. "/course_content/2017/coursea-2017.json"
      # @return [Hash, nil] the Crowdin source file data
      def get_source_file(crowdin_file_path)
        crowdin_file_name = crowdin_source_name(crowdin_file_path)

        request_offset = 0
        crowdin_file = nil

        loop do
          crowdin_files = request(:list_files, filter: crowdin_file_name, offset: request_offset, limit: MAX_ITEMS_COUNT)['data']

          crowdin_file = crowdin_files.find {|file| file.dig('data', 'path') == crowdin_file_path}

          break if crowdin_file || crowdin_files.size < MAX_ITEMS_COUNT

          request_offset += MAX_ITEMS_COUNT
        end

        crowdin_file&.dig('data')
      end

      # Uploads file to Crowdin Storage to obtain a unique `storageId` for adding it to the project later
      # https://developer.crowdin.com/api/v2/#operation/api.storages.post
      #
      # @param file_path [String] the i18n file path
      # @return [Hash] the Crowdin storage data
      def add_storage(file_path)
        request(:add_storage, file_path)['data']
      end

      # Uploads the given i18n source file to Crowdin project
      # https://developer.crowdin.com/api/v2/#section/Introduction/File-Upload
      #
      # https://developer.crowdin.com/api/v2/#operation/api.projects.files.post
      # https://developer.crowdin.com/api/v2/#operation/api.projects.files.put
      #
      # @param file_path [String] the i18n source file path
      # @param crowdin_dir_path [String] the absolute Crowdin source file path, e.g. "/course_content/2017"
      # @return [Hash] the Crowdin source file data
      def upload_source_file(file_path, crowdin_dir_path = File::SEPARATOR)
        crowdin_storage = add_storage(file_path)
        crowdin_storage_id = crowdin_storage['id']
        crowdin_file = get_source_file File.join(crowdin_dir_path, crowdin_storage['fileName'])

        if crowdin_file
          request(
            :update_or_restore_file,
            crowdin_file['id'],
            storageId: crowdin_storage_id,
          )['data']
        else
          crowdin_directory = source_directory(crowdin_dir_path)

          request(
            :add_file,
            storageId: crowdin_storage_id,
            directoryId: crowdin_directory&.dig('id'),
            name: crowdin_storage['fileName'],
          )['data']
        end
      ensure
        request(:delete_storage, crowdin_storage_id) if crowdin_storage_id
      end

      # Uploads the given i18n source files to Crowdin project
      #
      # @param source_files [Array<String>] the i18n source file paths
      # @param :base_path [String] the i18n source base path
      # @yield [Hash] the uploaded Crowdin source file data
      # @return [Array<Hash>] the Crowdin source files data
      def upload_source_files(source_files, base_path:)
        source_files_data = []

        mutex = Thread::Mutex.new
        I18nScriptUtils.process_in_threads(source_files, in_threads: MAX_CONCURRENT_REQUESTS) do |source_file_path|
          crowdin_file_path = File.join File::SEPARATOR, source_file_path.delete_prefix(base_path)
          crowdin_dir_path = File.dirname(crowdin_file_path)

          source_file_data = upload_source_file(source_file_path, crowdin_dir_path)

          mutex.synchronize {yield source_file_data} if block_given?
          mutex.synchronize {source_files_data << source_file_data}
        end

        source_files_data
      end

      private

      attr_reader :project, :client

      def crowdin_source_name(source_path)
        File.basename(source_path).remove(File::SEPARATOR)
      end

      # Retrieves an existing Crowdin source directory or creates a new one if not found
      # Stores the directory data in an instance variable to avoid unnecessary API calls
      #
      # @param crowdin_dir_path [String] the absolute Crowdin source directory path, e.g "/course_content/2017"
      # @return [Hash, nil] the Crowdin source directory data
      def source_directory(crowdin_dir_path)
        return if crowdin_dir_path.empty? || crowdin_dir_path == File::SEPARATOR

        @source_directories ||= {}
        return @source_directories[crowdin_dir_path] if @source_directories.key?(crowdin_dir_path)

        @source_directories[crowdin_dir_path] ||= get_source_directory(crowdin_dir_path)
        @source_directories[crowdin_dir_path] ||= add_source_directory(crowdin_dir_path)

        @source_directories[crowdin_dir_path]
      rescue RequestError => exception
        # request errors:
        # - "directory[parallelCreation]: Already creating directory..."
        # - "name[notUnique]: Invalid name given. Name must be unique"
        # indicate that the directory is creating/created by another concurrent process, so we can try to get it again.
        if ['Already creating directory', 'Name must be unique'].any? {|error| exception.message.include?(error)}
          @source_directories[crowdin_dir_path] ||= get_source_directory(crowdin_dir_path)
        else
          raise exception
        end
      end

      def stringify_errors(errors)
        messages = []

        errors.each do |error|
          error_key = error.dig('error', 'key')

          error.dig('error', 'errors').each do |child_error|
            error_code = child_error['code']
            error_message = child_error['message']

            messages << "#{error_key}[#{error_code}]: #{error_message}"
          end
        end

        messages.join("\n")
      end

      def request(endpoint, *params)
        response = client.public_send(endpoint, *params)

        if response.is_a?(String) && response.include?('Something went wrong')
          # e.g. "Something went wrong while request processing. Details - 429 Too Many Requests"
          raise RequestError, response
        elsif response.is_a?(Hash) && response['error']
          # e.g. {"error"=>{"code"=>429, "message"=>"Too Many Requests"}}
          raise RequestError, "#{response.dig('error', 'code')} #{response.dig('error', 'message')}"
        elsif response.is_a?(Hash) && response['errors']
          # e.g. {"errors"=>[{"error"=>{"key"=>"id", "errors"=>[{"code"=>"notNull", "message"=>"Can't be null"}]}}]}
          raise RequestError, stringify_errors(response['errors'])
        end

        response
      rescue StandardError => exception
        attempt = (attempt || 0) + 1

        if attempt <= REQUEST_RETRY_ATTEMPTS && RETRIABLE_ERRORS.any? {|error| exception.message.include?(error)}
          sleep(REQUEST_RETRY_DELAY)
          retry
        else
          exception.message << "\nProject:  #{project}"
          exception.message << "\nEndpoint: #{endpoint}"
          exception.message << "\nParams:   #{params.inspect}"
          exception.message << "\nAttempt:  #{attempt}"

          raise exception
        end
      end
    end
  end
end
