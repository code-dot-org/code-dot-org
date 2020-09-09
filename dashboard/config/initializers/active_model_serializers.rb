# Patch to allow serializing String and Hash objects by default
class StringSerializer < ActiveModel::Serializer
  def attributes(obj)
    @object.to_s
  end
end
class IntegerSerializer < StringSerializer; end
class HashSerializer < ActiveModel::Serializer
  def attributes(obj)
    @object.as_json
  end
end
class ActiveModel::ErrorsSerializer < HashSerializer; end

ActiveModel::Serializer.config.adapter = :Json
