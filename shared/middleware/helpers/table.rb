require 'csv'
require 'set'

require_relative './sql_table'
require_relative './dynamo_table'

class TableMetadata
  def self.generate_column_list(records)
    return [] if records.nil?
    # don't include 'id', since that's a reserved column that will always exist
    records.map(&:keys).flatten.uniq - ['id']
  end

  def self.remove_column(column_list, column_name)
    raise 'No such column' unless column_list.include? column_name

    new_list = column_list.dup
    new_list.delete(column_name)
    new_list
  end

  def self.add_column(column_list, column_name)
    return [column_name] if column_list.nil?
    raise 'Column already exists' if column_list.include? column_name
    column_list.dup.push(column_name)
  end

  def self.rename_column(column_list, old_name, new_name)
    raise 'Column doesnt exist' unless column_list.include? old_name
    raise 'Column already exists' if column_list.include? new_name

    column_list.map { |x| x == old_name ? new_name : x }
  end
end

# Converts an array of hashes into a csv string
def table_to_csv(table_array, column_order: nil)
  # Since not every row will have all the columns we need to take
  # two passes through the table. The first is to
  # collect all the column names and the second to write the data.

  unique_columns = Set.new

  table_array.each do |table_row|
    unique_columns.merge(table_row.keys)
  end

  unique_columns = unique_columns.to_a
  if column_order
    column_order.reverse_each do |c|
      unique_columns.delete(c)
      unique_columns.insert(0, c)
    end
  end

  csv_string = CSV.generate do |csv|
    csv << unique_columns
    table_array.each do |table_row|
      csv << unique_columns.collect { |x| table_row[x] }
    end
  end
  return csv_string
end
