class NoUtf8mb4Validator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    if value.to_s.utf8mb4?
      record.errors[attribute] << (options[:message] || "is invalid")
    end
  end
end
