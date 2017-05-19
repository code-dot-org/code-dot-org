module ActiveRecord
  module Persistence
    module ClassMethods

      def atomic_create!(attributes = nil, &block)
        if attributes.is_a?(Array)
          raise "An array of records can't be atomic"
        else
          object = new(attributes, &block)
          object.atomic_save!
          object
        end
      end

    end

    alias_method :atomic_save!, :save!
  end
end

module ActiveRecord
  module Transactions

    def atomic_save!(*)
      super
    end

  end
end
