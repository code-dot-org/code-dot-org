require 'json'
require 'date'
require 'active_support'
require 'active_support/core_ext/string/multibyte'

module Cdo
  class JSONtoRedshiftTableValidator
    class ValidationError < StandardError; end

    # Validate a JSON Record against a destination Redshift table schema.
    #
    # @param record_string [String] The JSON string representation of a record to validate and possibly modify.
    # @param redshift_schema [Hash] The schema definition for the Redshift table. Expected to have the following structure:
    #   {
    #     type: "redshift_table",
    #     columns: {
    #       column_name: {
    #         type: "redshift_data_type",
    #         maxLength: integer, # Only for character types
    #         nullable: boolean
    #       },
    #       # ... other columns ...
    #     }
    #   }
    # @param modify_invalid [Boolean] If true, attempt to modify invalid data to make it valid. If false, raise an error for any invalid data. Default is false.
    #
    # @return [String, Array<String>] A two-element array containing:
    #   1. The validated (and possibly modified) JSON string representation of the record.
    #   2. An Array of validation errors found in the record. Empty if none were found.
    #
    # @raise [JSON::ParserError] If the input record is invalid JSON and cannot be parsed
    # @raise [ValidationError] If the schema is invalid (not a Redshift table schema)
    # @raise [ValidationError] If any data is invalid and modify_invalid is false
    #
    # @example
    #   schema = {
    #     type: "redshift_table",
    #     columns: {
    #       id: { type: "integer", nullable: false },
    #       name: { type: "character varying", maxLength: 255 }
    #     }
    #   }
    #   json_string = '{"id": 1, "name": "John Doe"}'
    #   validated_record, errors = JSONtoRedshiftTableValidator.validate(record_string, redshift_schema)
    def self.validate(record_string, redshift_schema, modify_invalid: false)
      new(redshift_schema, modify_invalid).validate(record_string)
    end

    def initialize(redshift_schema, modify_invalid)
      @redshift_schema = redshift_schema
      @modify_invalid = modify_invalid
      @errors = []
    end

    def validate(record_string)
      raise ValidationError, "Invalid schema type" unless @redshift_schema[:type] == "redshift_table"

      begin
        record = JSON.parse(record_string)
      rescue JSON::ParserError => exception
        raise ValidationError, "Invalid JSON string: #{exception.message}"
      end

      modified_record = {}
      # One side effect of iterating through the Redshift schema to build up the modified_record is that we remove any top level
      # attribute of the input record that doesn't have a corresponding destination column in Redshift.
      @redshift_schema[:columns].each do |key, column_schema|
        if record[key.to_s].present?
          modified_record[key.to_s] = validate_column(key.to_s, record[key.to_s], column_schema)
          # Redshift columns are nullable by default, so make sure the 'nullable' setting is present for the current column.
        elsif column_schema.key?(:nullable) && column_schema[:nullable] == false
          @errors << "Required column is missing or empty: #{key}"
        end
      end

      raise ValidationError, @errors.join(", ") if @errors.any? && !@modify_invalid

      [@modify_invalid ? modified_record.to_json : record_string, @errors]
    end

    private def validate_column(key, value, column_schema)
      return nil if value.nil? && column_schema[:nullable] != false

      case column_schema[:type]
      when 'timestamp without time zone'
        validate_timestamp(key, value)
      when 'character'
        validate_character(key, value, column_schema[:maxLength])
      when 'character varying'
        validate_character_varying(key, value, column_schema[:maxLength])
      when 'integer'
        validate_integer(key, value)
      when 'double precision'
        validate_double(key, value)
      else
        @errors << "Unknown Redshift type for column `#{key}`: `#{column_schema[:type]}`"
        value
      end
    end

    private def validate_timestamp(key, value)
      DateTime.iso8601(value)
      value
    rescue ArgumentError
      @errors << "Invalid timestamp format for `#{key}`: `#{value}`"
      @modify_invalid ? nil : value
    end

    private def validate_character(key, value, max_length)
      value_string = value.is_a?(Hash) ? value.to_json : value.to_s
      unless value_string.is_a?(String)
        @errors << "Invalid type for `#{key}`: expected String, got #{value_string.class}"
        value_string = value_string.to_s if @modify_invalid
      end

      multibyte_value_string = ActiveSupport::Multibyte::Chars.new(value_string)

      if multibyte_value_string.bytes.size > max_length
        @errors << "Value too long for `#{key}`: #{multibyte_value_string.bytes.size} bytes (max #{max_length})"
        value_string = multibyte_value_string.limit(max_length).to_s if @modify_invalid
      end

      unless multibyte_value_string.ascii_only?
        @errors << "Invalid character(s) in CHAR column `#{key}`: contains non-ASCII characters"
        if @modify_invalid
          value_string = multibyte_value_string.unicode_normalize(:nfkc).gsub(/[^\x00-\x7F]/, '?').to_s
        end
      end

      value_string
    end

    private def validate_character_varying(key, value, max_length)
      value_string = value.is_a?(Hash) ? value.to_json : value.to_s
      unless value_string.is_a?(String)
        @errors << "Invalid type for `#{key}`: expected String, got #{value.class}"
        value_string = value_string.to_s if @modify_invalid
      end

      multibyte_string_value = ActiveSupport::Multibyte::Chars.new(value_string)

      if multibyte_string_value.bytes.size > max_length
        @errors << "Value too long for `#{key}`: #{multibyte_string_value.bytes.size} bytes (max #{max_length})"
        value_string =  multibyte_string_value.limit(max_length).to_s if @modify_invalid
      end

      value_string
    end

    private def validate_integer(key, value)
      begin
        integer_value = value.is_a?(String) ? Integer(value) : value
      rescue ArgumentError
        @errors << "Not an integer for `#{key}`: `#{value}`."
        return @modify_invalid ? nil : value
      end

      # Redshift integer range: -2^31 to 2^31 - 1
      if integer_value < -2_147_483_648 || integer_value > 2_147_483_647
        @errors << "Integer out of range for `#{key}`: `#{value}`"
        return @modify_invalid ? nil : value
      end

      integer_value
    end

    private def validate_double(key, value)
      begin
        float_value = value.is_a?(String) ? Float(value) : value
      rescue ArgumentError
        @errors << "Not a double precision for `#{key}`: `#{value}`."
        return @modify_invalid ? nil : value
      end

      unless float_value.is_a?(Float)
        @errors << "Invalid double precision for `#{key}`: `#{value}`"
        return @modify_invalid ? nil : value
      end

      # Redshift double precision range
      if float_value.abs > 1.79769313486231570e+308 || (float_value.abs < 2.22507385850720140e-308 && float_value != 0)
        @errors << "Double precision out of range for `#{key}`: `#{value}`"
        return @modify_invalid ? nil : value
      end

      float_value
    end
  end
end
