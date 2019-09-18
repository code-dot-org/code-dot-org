require 'active_support/core_ext/object/blank'
require 'active_support/core_ext/object/try'
require 'validates_email_format_of'
require_relative 'pegasus_form_errors'
require_relative '../cdo/regexp'
require_relative '../cdo/geocoder'

module PegasusFormValidation
  private

  def csv_multivalue(value)
    return value if value.class == FieldError
    begin
      CSV.parse_line(value.to_s) || []
    rescue
      return FieldError.new(value, :invalid)
    end
  end

  def default_if_empty(value, default_value)
    return value if value.class == FieldError
    return default_value if value.blank?
    value
  end

  def downcased(value)
    return value if value.class == FieldError
    if value.is_a?(Enumerable)
      value.map {|i| i.to_s.downcase}
    else
      value.to_s.downcase
    end
  end

  def enum(value, allowed)
    return value if value.class == FieldError
    return FieldError.new(value, :invalid) unless allowed.include?(value)
    value
  end

  def integer(value)
    return value if value.class == FieldError
    return nil if value.blank?

    s_value = value.to_s.strip
    i_value = s_value.to_i
    return FieldError.new(value, :invalid) unless i_value.to_s == s_value

    i_value
  end

  def nil_if_empty(value)
    return value if value.class == FieldError
    return nil if value.blank?
    value
  end

  def required(value)
    return value if value.class == FieldError
    return value if value.is_a? Integer
    return FieldError.new(value, :required) if value.blank?
    value
  end

  def stripped(value)
    return value if value.class == FieldError
    if value.is_a?(Enumerable)
      value.map {|i| i.to_s.strip}
    else
      value.to_s.strip
    end
  end

  def uploaded_file(value)
    return value if value.class == FieldError
    return nil if value.blank?
    AWS::S3.upload_to_bucket('cdo-form-uploads', value[:filename], open(value[:tempfile]))
  end

  def email_address(value)
    return value if value.class == FieldError
    email = downcased stripped value
    return nil if email.blank?
    return FieldError.new(value, :invalid) unless ValidatesEmailFormatOf.validate_email_format(email).nil?
    email
  end

  def zip_code(value)
    return value if value.class == FieldError
    value = stripped value
    return nil if value.blank?

    unless RegexpUtils.us_zip_code?(value) && Geocoder.search(value).try(:first).try(:postal_code)
      return FieldError.new(value, :invalid)
    end
    value
  end

  def confirm_match(value, value2)
    return value if value.class == FieldError
    return FieldError.new(value, :mismatch) if value != value2
    value
  end

  def us_phone_number(value)
    return value if value.class == FieldError
    value = stripped value
    return nil if value.blank?
    return FieldError.new(value, :invalid) unless RegexpUtils.us_phone_number?(value)
    RegexpUtils.extract_us_phone_number_digits(value)
  end

  def data_to_errors(data)
    errors = {}

    data.each_pair do |key, value|
      if value.class == FieldError
        errors[key] = [value.message]
      elsif value.class == Hash
        suberrors = data_to_errors(value)
        suberrors.each_pair do |subkey, subvalue|
          newkey = "#{key}[#{subkey}]".to_sym
          errors[newkey] = subvalue
        end
      end
    end

    errors
  end

  def validate_form(kind, data, logger = nil)
    data = Object.const_get(kind).normalize(data)

    errors = data_to_errors(data)
    raise FormError.new(kind, errors, logger) unless errors.empty?

    data
  end

  # Recursively replace special characters with HTML entities for string content in the input.
  # This function can be called either before saving user input to database or before returning user
  # input from database to client for presentation.
  # @note Calling it on already-escaped string may return malformed content. See unit test for example.
  #
  # @param [String, Hash, Array] input
  # @return [String, Hash, Array] a modified copy of the input if it is one of the specified data types.
  #   Otherwise, return the same input.
  def escape_html_entities(input)
    return CGI.escapeHTML(input) if input.is_a? String

    if input.is_a? Array
      return input.map {|item| escape_html_entities(item)}
    end

    if input.is_a? Hash
      return {}.tap do |output|
        input.keys.each do |key|
          output[key] = escape_html_entities(input[key])
        end
      end
    end

    # Input is not one of the types this function knows how to process. Return input as-is.
    input
  end
end
