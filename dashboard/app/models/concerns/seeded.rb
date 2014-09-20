# Utility methods for seeding models
module Seeded
  extend ActiveSupport::Concern

  module ClassMethods
    # (USE WITH CAUTION) Deletes ALL data from the specified DB table
    def reset_db
      self.delete_all # use delete instead of destroy so callbacks are not called
    # (disable reset_autoincrement until tested on production server)
    #   reset_autoincrement
    end

    # Reset autoincrement primary key
    # See: http://stackoverflow.com/a/5437720
    def reset_autoincrement
      connection = self.connection
      table = self.table_name
      id = self.primary_key
      connection.execute("SET @count = 0")
      connection.execute("UPDATE #{table} SET #{table}.#{id} = @count:= @count + 1")
      connection.execute("ALTER TABLE #{table} auto_increment = 1")
    end

    # Load and parse a CSV file
    def load_csv(file, col_sep=',', column_to_key={}, &block)
      parse_csv(File.read(file), col_sep, column_to_key, &block)
    end

    # Convert CSV string into hash, with column headers as keys
    # Removes entries with nil values
    # Optional argument maps column headers to hash keys
    def parse_csv(csv, col_sep=',', column_to_key={}, &block)
      CSV.parse(csv, {col_sep: col_sep, headers: true}).map do |row|
        hash = row.to_hash
        hash.keys.each { |key| hash[column_to_key[key]] = hash.delete(key) if column_to_key[key] }
        hash.delete_if { |_, value| value.nil? }
        yield hash if block
        hash
      end
    end

    # Load a YAML script containing options and data
    # Parses 'TSV'/'CSV' keys as spreadsheets
    def load_yaml(file, column_to_key={})
      data = YAML.load_file(file)

      # Set Options and remove element from hash
      data, options = data.partition { |x| x['Options'].nil? }
      options = options.empty? ? {} : options[0]['Options']

      [%W(TSV \t), %w(CSV ,)].each do |xsv, sep|
        data, xsv_data = data.partition { |x| !x || x[xsv].nil? }
        var = xsv_data.flat_map { |entry| parse_csv(entry[xsv], sep, column_to_key) }
        data += var unless var.nil?
      end
      [options, data]
    end
  end
end
