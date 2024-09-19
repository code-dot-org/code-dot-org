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

        string_value = value.is_a?(String) ? value : value.to_json
        byte_length = string_value.encode('UTF-8').bytesize

        if byte_length > field_schema['maxLength']
          error_msg = "Redshift column #{field} exceeds maximum byte length of #{field_schema['maxLength']} (current: #{byte_length} bytes)"
          errors << error_msg
          CDO.log.error(error_msg)

          if modify_invalid
            truncated_value = truncate_to_byte_length(string_value, field_schema['maxLength'])
            record[field] = value.is_a?(String) ? truncated_value : JSON.parse(truncated_value)
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

      private def truncate_to_byte_length(string, max_bytes)
        return string if string.encode('UTF-8').bytesize <= max_bytes

        truncated = string.encode('UTF-8')
        truncated = truncated[0...-1] while truncated.bytesize > max_bytes
        truncated
      end
    end
  end
end
