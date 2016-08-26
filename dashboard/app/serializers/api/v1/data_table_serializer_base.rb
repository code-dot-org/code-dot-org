# Serialize into google chart DataTable json.
# See https://developers.google.com/chart/interactive/docs/reference
#
# To use, extend your serializer from this this base class,
# provide attributes for :cols and :rows, and implement column_definitions
# Example:
# class MyDataTableSerializer < DataTableSerializerHelper
#   attributes :cols, :rows
#
#   def column_definitions
#     [
#       :name,
#       :email
#     ]
#   end
# end

class Api::V1::DataTableSerializerBase < ::ActiveModel::Serializer
  # Override in derived serializer
  # Column Definitions follow this format:
  #   Each column definition is either:
  #     - string or symbol: symbol key name for a string column with a basic string data display in the rows.
  #     - hash of:
  #         - key: column key name (required)
  #         - type: data type if other than string ('number', 'boolean', etc.)
  #         - format: optional lambda returning the string format for each data row if other than basic string.
  #                   It gets value as a parameter.
  #
  #   A column name will generate a column header as a titleized version of that name,
  #   and refer to data under the key-name in the input data hash for each row
  #
  #   Example:
  #   [
  #     :workshop_title,
  #     {key: :workshop_id, type: 'number'},
  #     {key: :num_enrollments, type: 'number', format ->(value) {value > 0 ? 'None' : value}}
  #   ]
  def column_definitions
    []
  end

  # String.titleize strips id from the name, but we want to preserve it here.
  def titleize_with_id(symbol)
    stringified = symbol.to_s
    stringified.titleize + (stringified.end_with?('_id') ? ' Id' : '')
  end

  def generate_columns
    column_definitions.map do |column_definition|
      case column_definition
      when String, Symbol
        {label: titleize_with_id(column_definition), type: 'string'}
      when Hash
        type = column_definition[:type] || 'string'
        {label: titleize_with_id(column_definition[:key]), type: type}
      else
        raise "Unexpected column definition type: #{column_definition.class}"
      end
    end
  end

  def generate_rows(source_rows)
    source_rows.map do |source_row|
      generate_row source_row
    end
  end

  def generate_row(source_row)
    {c:
      column_definitions.map do |column_definition|
        case column_definition
        when String, Symbol
          {v: source_row[column_definition]}
        when Hash
          value = source_row[column_definition[:key]]
          {v: value}.tap do |row|
            if column_definition[:format]
              row.merge!({f: column_definition[:format].call(value)})
            end
          end
        else
          raise "Unexpected column definition type: #{column_definition.class}"
        end
      end
    }
  end

  def cols
    generate_columns
  end

  def rows
    generate_rows object
  end
end
