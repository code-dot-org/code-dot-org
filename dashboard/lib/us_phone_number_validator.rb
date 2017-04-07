require 'cdo/regexp'
# Validates the format of a US phone number.
# Note - does not validate that it's an actual phone number.
class UsPhoneNumberValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless RegexpUtils.us_phone_number? value.to_s
      record.errors[attribute] << (options[:message] || 'is invalid')
    end
  end
end
