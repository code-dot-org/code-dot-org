module Cdo
  module JSONtoRedshiftTableValidator
    class ValidationError < StandardError
      attr_reader :errors

      def initialize(errors)
        @errors = errors
        super("Redshift table row validation failed: #{errors.join(', ')}")
      end
    end

    class << self
      # Validates a JSON record against a schema for Redshift table compatibility
      #
      # @param record [Hash] Hash representation of JSON record.
      # @param schema [Hash] The schema defining the structure and constraints of the Redshift table.
      # @param modify_invalid [Boolean] Whether to modify invalid values (e.g., truncate oversized strings) instead of raising an error
      #
      # @return [Array<Hash, Boolean>] An array containing the potentially modified record and a boolean indicating if any errors were found
      #
      # @raise [ValidationError] If validation fails and modify_invalid is false
      def validate(record, schema, modify_invalid: false)
        errors = []
        validate_required_fields(record, schema, errors)
        validate_properties(record, schema, errors, modify_invalid)

        if errors.any? && !modify_invalid
          raise ValidationError.new(errors)
        end

        [record, errors.any?]
      end

      private def validate_required_fields(record, schema, errors)
        schema['required']&.each do |field|
          if !record.key?(field) || record[field].nil?
            error_msg = "Missing required field for Redshift table: #{field}"
            errors << error_msg
            CDO.log.error(error_msg)
          end
        end
      end

      private def validate_properties(record, schema, errors, modify_invalid)
        schema['properties']&.each do |field, field_schema|
          next unless record.key?(field) && !record[field].nil?
          value = record[field]

          validate_type(field, value, field_schema, errors)
          validate_format(field, value, field_schema, errors)
          validate_length(field, value, field_schema, errors, record, modify_invalid)
        end
      end

      private def validate_type(field, value, field_schema, errors)
        types = Array(field_schema['type'])
        unless types.any? {|t| valid_type?(value, t)}
          error_msg = "Invalid type for Redshift column #{field}: expected #{types.join(' or ')}, got #{value.class}"
          errors << error_msg
          CDO.log.error(error_msg)
        end
      end

      private def validate_format(field, value, field_schema, errors)
        if field_schema['format'] == 'date-time' && value.is_a?(String)
          begin
            DateTime.iso8601(value)
          rescue ArgumentError
            error_msg = "Invalid date-time format for Redshift column #{field}: #{value}"
            errors << error_msg
            CDO.log.error(error_msg)
          end
        end
      end

      private def validate_length(field, value, field_schema, errors, record, modify_invalid)
        return unless field_schema['maxLength'] && (value.is_a?(String) || value.is_a?(Hash))

        multibyte_string = ActiveSupport::Multibyte::Chars.new(value.is_a?(String) ? value : value.to_json)

        if multibyte_string.bytesize > field_schema['maxLength']
          error_msg = "Redshift column #{field} exceeds maximum byte length of #{field_schema['maxLength']} (current: #{multibyte_string.length} characters, #{multibyte_string.bytesize} bytes)"
          errors << error_msg
          CDO.log.error(error_msg)

          if modify_invalid
            record[field] = multibyte_string.limit(field_schema['maxLength']).to_s
            CDO.log.warn("Truncated #{field} to fit Redshift column length")
          end
        end
      end

      private def valid_type?(value, type)
        case type
        when 'string' then value.is_a?(String)
        when 'integer' then value.is_a?(Integer)
        when 'number' then value.is_a?(Numeric)
        when 'object' then value.is_a?(Hash)
        when 'null' then value.nil?
        else false
        end
      end
    end
  end
end
