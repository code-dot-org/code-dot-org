require 'crowdin-api'

#
# Add functionalities to the Crowdin::Client class in the crowdin-api gem.
#
module Crowdin
  module ClientExtensions
    # Project Id is at https://crowdin.com/project/<project_name>/tools/api
    # Project source language is at https://crowdin.com/project/<project_name>/settings
    CDO_PROJECT_IDS = {
      'codeorg' => 26074,
      'hour-of-code' => 55536,
      'codeorg-markdown' => 314545,
      'codeorg-restricted' => 464582,
      'codeorg-testing' => 346087,
      'codeorg-markdown-testing' => 547997
    }

    CDO_PROJECT_SOURCE_LANGUAGES = {
      'codeorg' => 'enus',
      'hour-of-code' => 'en',
      'codeorg-markdown' => 'en',
      'codeorg-restricted' => 'en',
      'codeorg-testing' => 'en'
    }

    # Maximum number of items to retrieve from Crowdin in an API call
    MAX_ITEMS_COUNT = 500

    # Send requests to Crowdin in a loop until the number of items retrieved
    # is less than an expected limit.
    #
    # @param query [Hash] query string params used in the requests
    # @yieldparam query [Hash] updated query string params
    # @yieldreturn [Array] the response from Crowdin
    # @return [Array] all responses from Crowdin
    #
    def request_loop(query)
      raise 'Missing block' unless block_given?

      results = []
      loop do
        # yield to the given block to do real work
        response = yield query
        raise 'Crowdin request failed!' if response.is_a?(String) && response.match?('Something went wrong')

        puts "Offset = #{query[:offset]}. Response size = #{response['data'].size}"
        results.concat(response['data'])
        query[:offset] += response['data'].size
        break if response['data'].size < query[:limit]
      end

      results
    end

    # Download a list of all Crowdin's supported languages.
    #
    # @param limit [Number] maximum number of items to retrieve in an API call
    # @return [Array<Hash>] array of all languages
    #
    def download_languages(limit = MAX_ITEMS_COUNT)
      query = {
        limit: limit,
        offset: 0
      }

      languages = request_loop(query) do
        list_languages(query)
      end

      puts "Downloaded #{languages.size} languages"
      languages.map do |language|
        language['data']
      end
    end

    # Download all translations that were create for a project in a language
    # by a user during a time period.
    #
    # E.g. download_translations('codeorg','it','Tomedes','2021-11-01','2022-01-01')
    #
    # @param project_name [String]
    # @param crowdin_language_id [String]
    # @param user_names [Array<String>]
    # @param start_date [String]
    # @param end_date [String]
    # @param limit [Number]
    # @return Array<Hash> array of translations
    #
    def download_translations(project_name, crowdin_language_id, user_names, start_date, end_date, limit = MAX_ITEMS_COUNT)
      query = {
        croql: "#{create_user_query(user_names)} and updated>='#{start_date}' and updated<'#{end_date}'",
        limit: limit,
        offset: 0
      }

      project_id = CDO_PROJECT_IDS[project_name]
      translations = request_loop(query) do
        list_language_translations(crowdin_language_id, query, project_id)
      end

      translations.map do |translation|
        translation['data']['crowdin_language_id'] = crowdin_language_id
        translation['data']
      end
    end

    # Download all source strings that have translations created for a project
    # in a language by a user during a time period.
    #
    # E.g. download_source_strings('codeorg','it','Tomedes','2021-11-01','2022-01-01')
    #
    # @param project_name [String]
    # @param crowdin_language_id [String]
    # @param user_names [Array<String>]
    # @param start_date [String]
    # @param end_date [String]
    # @param limit [Number]
    # @return Array<Hash> array of source strings
    #
    def download_source_strings(project_name, crowdin_language_id, user_names, start_date, end_date, limit = MAX_ITEMS_COUNT)
      query = {
        croql: "count of translations where (" \
          "language=@language:\"#{crowdin_language_id}\" and " \
          "#{create_user_query(user_names)} and " \
          "updated>='#{start_date}' and " \
          "updated<'#{end_date}'" \
          ") > 0",
        limit: limit,
        offset: 0
      }

      project_id = CDO_PROJECT_IDS[project_name]
      source_strings = request_loop(query) do
        list_strings(query, project_id)
      end

      source_strings.map do |string|
        string['data']
      end
    end

    # Create a Crowdin query using multiple user names.
    # The result can be embedded in another query.
    #
    # Example:
    #   input: ['user1', 'user2']
    #   output: '(user=@user:"user1" or user=@user:"user2")'
    #
    # @param user_names [Array<String>]
    # @return [String]
    def create_user_query(user_names)
      query = user_names.map do |user_name|
        "user=@user:\"#{user_name}\""
      end.join(' or ')

      "(#{query})"
    end
  end

  class CrowdinRateLimitError < StandardError
    def initialize(msg = "Rate Limit Error")
      super
    end
  end

  class CrowdinInternalServerError < StandardError
    def initialize(msg = "Internal Server Error")
      super
    end
  end

  class CrowdinServiceUnavailableError < StandardError
    def initialize(msg = "Service Unavailable")
      super
    end
  end

  class Client
    include ClientExtensions
  end
end
