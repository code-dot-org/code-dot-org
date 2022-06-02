require 'crowdin-api'

#
# Add functionalities to the Crowdin::Client class in the crowdin-api gem.
#
module Crowdin
  module ClientExtensions
    # Project Id is at https://crowdin.com/project/<project_name>/tools/api
    # Project source language is at https://crowdin.com/project/<project_name>/settings
    CDO_PROJECTS = {
      codeorg: {
        id: 26074,
        source_language: 'enus'
      },
      'hour-of-code': {
        id: 55536,
        source_language: 'en'
      },
      'codeorg-markdown': {
        id: 314545,
        source_language: 'en'
      },
      'codeorg-restricted': {
        id: 464582,
        source_language: 'en'
      }
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
    # @param project_name [String, Symbol]
    # @param crowdin_language_id [String]
    # @param user_name [String]
    # @param start_date [String]
    # @param end_date [String]
    # @param limit [Number]
    # @return Array<Hash> array of translations
    #
    def download_translations(project_name, crowdin_language_id, user_name, start_date, end_date, limit = MAX_ITEMS_COUNT)
      query = {
        croql: "user=@user:\"#{user_name}\" and updated>='#{start_date}' and updated<'#{end_date}'",
        limit: limit,
        offset: 0
      }

      project_id = CDO_PROJECTS.dig(project_name.to_sym, :id)
      translations = request_loop(query) do
        list_language_translations(crowdin_language_id, query, project_id)
      end

      puts "Downloaded #{translations.size} translations"
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
    # @param project_name [String, Symbol]
    # @param crowdin_language_id [String]
    # @param user_name [String]
    # @param start_date [String]
    # @param end_date [String]
    # @param limit [Number]
    # @return Array<Hash> array of source strings
    #
    def download_source_strings(project_name, crowdin_language_id, user_name, start_date, end_date, limit = MAX_ITEMS_COUNT)
      query = {
        croql: "count of translations where (" \
          "language=@language:\"#{crowdin_language_id}\" and " \
          "user=@user:\"#{user_name}\" and " \
          "updated>='#{start_date}' and " \
          "updated<'#{end_date}'" \
          ") > 0",
        limit: limit,
        offset: 0
      }

      project_id = CDO_PROJECTS.dig(project_name.to_sym, :id)
      source_strings = request_loop(query) do
        list_strings(query, project_id)
      end

      puts "Downloaded #{source_strings.size} source strings"
      source_strings.map do |string|
        string['data']
      end
    end
  end

  class Client
    include ClientExtensions
  end
end
