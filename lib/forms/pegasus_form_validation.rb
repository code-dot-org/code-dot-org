require 'active_support/core_ext/object/blank'
require 'active_support/core_ext/object/try'
require 'validates_email_format_of'
require_relative 'pegasus_form_errors'
require_relative '../cdo/regexp'
require_relative '../cdo/geocoder'

module PegasusFormValidation
  private def csv_multivalue(value)
    return value if value.instance_of?(FieldError)
    begin
      CSV.parse_line(value.to_s) || []
    rescue
      return FieldError.new(value, :invalid)
    end
  end

  private def default_if_empty(value, default_value)
    return value if value.instance_of?(FieldError)
    return default_value if value.blank?
    value
  end

  private def downcased(value)
    return value if value.instance_of?(FieldError)
    if value.is_a?(Enumerable)
      value.map {|i| i.to_s.downcase}
    else
      value.to_s.downcase
    end
  end

  private def enum(value, allowed)
    return value if value.instance_of?(FieldError)
    return FieldError.new(value, :invalid) unless allowed.include?(value)
    value
  end

  private def integer(value)
    return value if value.instance_of?(FieldError)
    return nil if value.blank?

    s_value = value.to_s.strip
    i_value = s_value.to_i
    return FieldError.new(value, :invalid) unless i_value.to_s == s_value

    i_value
  end

  private def nil_if_empty(value)
    return value if value.instance_of?(FieldError)
    return nil if value.blank?
    value
  end

  private def required(value)
    return value if value.instance_of?(FieldError)
    return value if value.is_a? Integer
    return FieldError.new(value, :required) if value.blank?
    value
  end

  private def stripped(value)
    return value if value.instance_of?(FieldError)
    if value.is_a?(Enumerable)
      value.map {|i| i.to_s.strip}
    else
      value.to_s.strip
    end
  end

  private def uploaded_file(value)
    return value if value.instance_of?(FieldError)
    return nil if value.blank?
    AWS::S3.upload_to_bucket('cdo-form-uploads', value[:filename], File.open(value[:tempfile]))
  end

  private def email_address(value)
    return value if value.instance_of?(FieldError)
    email = downcased stripped value
    return nil if email.blank?
    return FieldError.new(value, :invalid) unless ValidatesEmailFormatOf.validate_email_format(email).nil?
    email
  end

  private def zip_code(value)
    return value if value.instance_of?(FieldError)
    value = stripped value
    return nil if value.blank?

    unless RegexpUtils.us_zip_code?(value) && Geocoder.search(value).try(:first).try(:postal_code)
      return FieldError.new(value, :invalid)
    end
    value
  end

  private def confirm_match(value, value2)
    return value if value.instance_of?(FieldError)
    return FieldError.new(value, :mismatch) if value != value2
    value
  end

  private def us_phone_number(value)
    return value if value.instance_of?(FieldError)
    value = stripped value
    return nil if value.blank?
    return FieldError.new(value, :invalid) unless RegexpUtils.us_phone_number?(value)
    RegexpUtils.extract_us_phone_number_digits(value)
  end

  private def data_to_errors(data)
    errors = {}

    data.each_pair do |key, value|
      if value.instance_of?(FieldError)
        errors[key] = [value.message]
      elsif value.instance_of?(Hash)
        suberrors = data_to_errors(value)
        suberrors.each_pair do |subkey, subvalue|
          newkey = "#{key}[#{subkey}]".to_sym
          errors[newkey] = subvalue
        end
      end
    end

    errors
  end

  private def validate_form(kind, data, logger = nil)
    data = Object.const_get(kind).normalize(data)

    errors = data_to_errors(data)
    raise FormError.new(kind, errors, logger) unless errors.empty?

    data
  end
end
