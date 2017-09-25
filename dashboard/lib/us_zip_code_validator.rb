require 'cdo/regexp'
# Validates the format of a US zip code.
# Note - does not validate that it's an actual zip code.
class UsZipCodeValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless RegexpUtils.us_zip_code? value.to_s
      record.errors[attribute] << (options[:message] || 'is invalid')
    end
  end
end
