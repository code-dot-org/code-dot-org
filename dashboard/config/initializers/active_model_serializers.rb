# Patch to allow serializing String and Hash objects by default
class StringSerializer < ActiveModel::Serializer
  def attributes(obj)
    @object.to_s
  end
end
class FixnumSerializer < StringSerializer; end
class HashSerializer < ActiveModel::Serializer
  def attributes(obj)
    @object.as_json
  end
end
class ActiveModel::ErrorsSerializer < HashSerializer; end

# Patch to provide more informative missing-serializer error message
module ActiveModel
  class Serializer
    # Copied from ActiveModel::Serializer#serializer_for
    def self.serializer_for(resource, options = {})
      if resource.respond_to?(:to_ary)
        config.array_serializer
      else
        options
            .fetch(:association_options, {})
            .fetch(:serializer, get_serializer_for(resource.class))
      end.tap{|serializer| raise "ActiveModel serializer not found for #{resource.class}, options: #{options}" if serializer.nil? }
    end
  end
end

ActiveModel::Serializer.config.adapter = :Json
