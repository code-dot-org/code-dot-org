require 'json'
require 'date'
require 'active_support'
require 'active_support/core_ext/string/multibyte'

module Cdo
  class JSONtoRedshiftTableValidator
    class ValidationError < StandardError; end

    # Validate a JSON Record against a destination Redshift table schema.
    #
    # @param record [String] The JSON string representation of a record to validate and possibly modify.
    # @param schema [Hash] The schema definition for the Redshift table. Expected to have the following structure:
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
    # @return [Array<String, Boolean>] A two-element array containing:
    #   1. The validated (and possibly modified) JSON string representation of the record
    #   2. A boolean indicating whether any modifications were made (true if modified, false otherwise)
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
    #   validated_data, modified = JSONtoRedshiftTableValidator.validate(json_string, schema)
    def self.validate(record, schema, modify_invalid: false)
      new(schema, modify_invalid).validate(record)
    end

    def initialize(schema, modify_invalid)
      @schema = schema
      @modify_invalid = modify_invalid
      @errors = []
    end

    def validate(record)
      raise ValidationError, "Invalid schema type" unless @schema[:type] == "redshift_table"

      begin
        parsed_record = JSON.parse(record)
      rescue JSON::ParserError => exception
        raise ValidationError, "Invalid JSON string: #{exception.message}"
      end

      validated_record = {}
      @schema[:columns].each do |key, column_schema|
        if parsed_record.key?(key.to_s)
          validated_record[key.to_s] = validate_column(key.to_s, parsed_record[key.to_s], column_schema)
          # Redshift columns are nullable by default, so make sure the 'nullable' setting is present for the current column.
        elsif column_schema.key?(:nullable) && column_schema[:nullable] == false
          @errors << "Missing non-nullable column: #{key}"
        end
      end

      raise ValidationError, @errors.join(", ") if @errors.any? && !@modify_invalid

      [validated_record.to_json, @errors.any?]
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
        @errors << "Unknown Redshift type for column #{key}: #{column_schema[:type]}"
        value
      end
    end

    private def validate_timestamp(key, value)
      DateTime.iso8601(value)
      value
    rescue ArgumentError
      @errors << "Invalid timestamp format for #{key}: #{value}"
      @modify_invalid ? nil : value
    end

    private def validate_character(key, value, max_length)
      unless value.is_a?(String)
        @errors << "Invalid type for #{key}: expected String, got #{value.class}"
        return @modify_invalid ? value.to_s : value
      end

      multibyte_value = ActiveSupport::Multibyte::Chars.new(value)

      if multibyte_value.bytes.size > max_length
        @errors << "Value too long for #{key}: #{multibyte_value.bytes.size} bytes (max #{max_length})"
        value = multibyte_value.limit(max_length).to_s if @modify_invalid
      end

      if multibyte_value.match?(/[^\x00-\x7F]/)
        @errors << "Invalid character(s) in CHAR column #{key}: contains non-ASCII characters"
        if @modify_invalid
          value = multibyte_value.normalize(:kc).gsub(/[^\x00-\x7F]/, '?').to_s
        end
      end

      value
    end

    private def validate_character_varying(key, value, max_length)
      value_string = value.is_a?(Hash) ? value.to_json : value
      unless value_string.is_a?(String)
        @errors << "Invalid type for #{key}: expected String, got #{value.class}"
        return @modify_invalid ? value.to_s : value
      end

      multibyte_string_value = ActiveSupport::Multibyte::Chars.new(value_string)

      if multibyte_string_value.bytes.size > max_length
        @errors << "Value too long for #{key}: #{multibyte_string_value.bytes.size} bytes (max #{max_length})"
        return @modify_invalid ? multibyte_string_value.limit(max_length).to_s : value
      end

      value
    end

    private def validate_integer(key, value)
      begin
        integer_value = value.is_a?(String) ? Integer(value) : value
      rescue ArgumentError
        @errors << "Not an integer for #{key}: #{value}."
        return @modify_invalid ? nil : value
      end

      # Redshift integer range: -2^31 to 2^31 - 1
      if integer_value < -2_147_483_648 || integer_value > 2_147_483_647
        @errors << "Integer out of range for #{key}: #{value}"
        return @modify_invalid ? nil : value
      end

      integer_value
    end

    private def validate_double(key, value)
      begin
        float_value = value.is_a?(String) ? Float(value) : value
      rescue ArgumentError
        @errors << "Not a double precision for #{key}: #{value}."
        return @modify_invalid ? nil : value
      end

      unless float_value.is_a?(Float)
        @errors << "Invalid double precision for #{key}: #{value}"
        return @modify_invalid ? nil : value
      end

      # Redshift double precision range
      if float_value.abs > 1.79769313486231570e+308 || (float_value.abs < 2.22507385850720140e-308 && float_value != 0)
        @errors << "Double precision out of range for #{key}: #{value}"
        return @modify_invalid ? nil : value
      end

      float_value
    end
  end
end
