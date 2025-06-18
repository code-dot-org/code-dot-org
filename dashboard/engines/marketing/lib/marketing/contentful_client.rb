require 'singleton'
require 'contentful'

module Marketing
  class ContentfulClient
    include Singleton

    class << self
      delegate :entry, to: :instance
    end

    def initialize
      @client = Contentful::Client.new(
        space: CDO.contentful_space_id,
        access_token: CDO.contentful_api_key,
        api_url: CDO.contentful_hostname
      )
    end

    def entry(locale, id)
      @client.entry(id, locale: locale)
    end
  end
end
