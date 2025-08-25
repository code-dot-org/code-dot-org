module CdoContentful
  module BaseEntry
    extend ActiveSupport::Concern

    class_methods do
      def content_type
        @content_type || raise(NotImplementedError, "#{self}.content_type is not set")
      end

      def where(limit: 100, **fields)
        entry_fields = fields.transform_keys {"fields.#{_1}"}
        client.entries(**entry_fields, content_type:, limit:)
      end

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
