# frozen_string_literal: true

module CdoContentful
  module BaseEntry
    extend ActiveSupport::Concern

    class_methods do
      DEFAULT_LOCALE = 'en-US'
      DEFAULT_LIMIT = 100

      # The set `content_type` or infer from class name
      def content_type
        @content_type || name.demodulize.camelize(:lower)
      end

      # Fetch an entry of this content type by its ID
      #
      # @param id [String] the ID of the entry to fetch
      # @param locale [String] the locale of the entry to fetch (default: 'en-US')
      #
      # @return [Contentful::Entry, nil] the entry with the given ID
      def find(id, locale: self::DEFAULT_LOCALE)
        client.entry(id, content_type:, locale:)
      end

      # Fetch entries of this content type matching the given fields
      #
      # @param limit [Integer] maximum number of entries to return (default: 100, max: 1000)
      # @param skip [Integer] number of entries to skip, acting as an offset (default: 0)
      # @param fields [Hash] field-value pairs to filter entries by, e.g. `where(tutorialID: 'my-id')`
      #
      # @return [Contentful::Array] of entries matching the given fields
      def where(locale: self::DEFAULT_LOCALE, limit: self::DEFAULT_LIMIT, skip: 0, **fields)
        entry_fields = fields.transform_keys {"fields.#{_1}"}
        client.entries(**entry_fields, content_type:, locale:, limit:, skip:)
      end

      # Fetch a single entry of this content type matching the given fields
      #
      # @return [Contentful::Entry, nil] the first entry matching the given fields
      def find_by(**fields)
        where(**fields, limit: 1).first
      end

      # Iterate over all entries of this content type matching the given fields
      #
      # @param limit [Integer] maximum number of entries to fetch per request (default: 100, max: 1000)
      # @param fields [Hash] field-value pairs to filter entries by, e.g. `find_each(tutorialID: 'my-id')`
      #
      # @yield [Contentful::Entry] gives each entry to the block
      # @return [Integer] the total number of entries yielded
      def find_each(limit: self::DEFAULT_LIMIT, **fields)
        skip = 0

        loop do
          entries = where(**fields, limit:, skip:)
          break if entries.empty?

          entries.each {yield _1}

          skip += entries.size
          break if skip >= entries.total
        end

        skip
      end

      private attr_writer :content_type, :client

      private def client
        @client || raise(NotImplementedError, "#{self}.client is not set")
      end
    end
  end
end
