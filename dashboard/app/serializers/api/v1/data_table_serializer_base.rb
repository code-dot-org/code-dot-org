# Serialize into google chart DataTable json.
# See https://developers.google.com/chart/interactive/docs/reference
#
# To use, extend your serializer from this this base class,
# and provide attributes for :cols and :rows.
# Example:
# class MyDataTableSerializer < DataTableSerializerHelper
#   attributes :cols, :rows
#
#   def cols
#     [data_table_column('Name'), data_table_column('Email')]
#   end
#
#   def rows(data)
#     data.map do |row|
#       data_table_row(row, :name, :email)
#     end
#   end
# end
class Api::V1::DataTableSerializerBase < ::ActiveModel::Serializer
  # Helper method for row values.
  # Params:
  #   row - a hash representing a row to serialize
  #   keys - a list of items that can be either:
  #      - string or symbol: key name in the row hash for simple cell
  #      - hash: Google DataTable format definition for more complex cell.
  #        In this case, you will need to reference the value via row[:field] directly.
  #        Example: {v: row[:price], f: "$#{row[:price]}"}
  # Returns: a Google DataTable formatted row based on the input row
  def data_table_row(row, keys)
    {c:
      keys.map do |key|
        case key
          when String, Symbol
            {v: row[key]}
          else
            key
        end
      end
    }
  end

  # Helper method for columns
  # Params:
  #   names - a list of items that can be either:
  #     - string or symbol: label name for a string column
  #     - hash: Google DataTable format definition for a non-string column
  #       or to provide custom formatting.
  #       For example: {label: 'Id', type: 'number'}
  # Returns: a column definition
  def data_table_columns(names)
    names.map do |name|
      case name
        when String, Symbol
          {label: name, type: 'string'}
        else
          name
      end
    end
  end
end
