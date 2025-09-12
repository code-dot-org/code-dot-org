module CdoContentful
  module BaseEntry
    extend ActiveSupport::Concern

    class_methods do
      def content_type
        @content_type || raise(NotImplementedError, "#{self}.content_type is not set")
      end

      # Fetch entries of this content type matching the given fields
      #
      # @param limit [Integer] maximum number of entries to return (default: 100, max: 1000)
      # @param skip [Integer] number of entries to skip, acting as an offset (default: 0)
      # @param fields [Hash] field-value pairs to filter entries by, e.g. `where(tutorialID: 'my-id')`
      #
      # @return [Contentful::Array] of entries matching the given fields
      def where(limit: 100, skip: 0, **fields)
        entry_fields = fields.transform_keys {"fields.#{_1}"}
        client.entries(**entry_fields, content_type:, limit:, skip:)
      end

      # Fetch a single entry of this content type matching the given fields
      #
      # @return [Contentful::Entry, nil] the first entry matching the given fields
      def find_by(**fields)
        where(**fields, limit: 1).first
      end

      private attr_writer :content_type, :client

      private def client
        @client || raise(NotImplementedError, "#{self}.client is not set")
      end
    end
  end
end
