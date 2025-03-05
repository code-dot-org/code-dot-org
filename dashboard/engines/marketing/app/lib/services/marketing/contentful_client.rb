require 'singleton'
require 'contentful'

module Services
  module Marketing
    class ContentfulClient
      include Singleton
      def initialize
        @client = Contentful::Client.new(
          space: '90t6bu6vlf76',
          access_token: CDO.contentful_api_key,
          api_url: CDO.contentful_hostname
        )
      end

      def entry(locale, id)
        entry = @client.entry(id, locale: locale)

        entry.fields[:items_in_this_list].map(&:fields)
      end
    end
  end
end
