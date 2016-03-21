# A set of methods for coercing data in our table to specific types. In general,
# the goal when converting is to change values where we can, but leave alone
# those where we don't know how to convert (i.e. I can't convert "123" to a
# boolean.

module TableCoerce
  TRUE = /^true$/i
  FALSE = /^false$/i
  NUMBER = /\A[-+]?[0-9]*\.?[0-9]+\Z/

  # Given a set of records, and a list of columns, attempt to convert each
  # column to a particular type. If we can convert the entire column to
  # number or boolean, we'll do that, otherwise we'll convert all values to strings.
  def TableCoerce.coerce_columns_from_data(records, columns)
    # first do a pass to determine types. we can't do coercion right away since
    # we dont want to change anything if we cant coerce the entire column
    # begin with no type definitions
    column_types = TableCoerce.column_types(records, columns)

    # second pass to convert values. by default, values are all strings
    records.each do |row|
      columns.each_index do |index|
        type = column_types[index]
        col = columns[index]
        val = row[col]
        if type == :boolean
          row[col] = TableCoerce.to_boolean(val)
        elsif type == :number
          row[col] = TableCoerce.to_number(val)
        end
      end
    end

    records
  end

  def TableCoerce.column_types(records, columns)
    # do an initial pass to determine column types
    return columns.map do |col|
      if records.empty?
        :string
      elsif !records.any? { |record| !TableCoerce.boolean?(record[col]) }
        :boolean
      elsif !records.any? { |record| !TableCoerce.number?(record[col]) }
        :number
      else
        :string
      end
    end
  end

  # Attempts to coerce a single column to the given type.
  # @return {[Array, boolean]} The new set of records, and a boolean indicating
  #  whether we were able to convert every single row.
  def TableCoerce.coerce_column(records, column_name, type)
    all_converted = true
    records.map do |record|
      val = record[column_name]
      if type == :boolean
        convertable = TableCoerce.boolean?(val)
        val = TableCoerce.to_boolean(val) if convertable
        all_converted = false unless convertable
      elsif type == :number
        convertable = TableCoerce.number?(val)
        val = TableCoerce.to_number(val) if convertable
        all_converted = false unless convertable
      elsif type == :string
        val = val.to_s
      end
      record[column_name] = val
      record
    end
    [records, all_converted]
  end

  # @param val [String|Boolean|Number]
  def TableCoerce.boolean?(val)
    return true if val == true || val == false
    return false unless val.is_a?(String)
    return !TRUE.match(val).nil? || !FALSE.match(val).nil?
  end

  # converts a value to a boolean, throwing if unable to do so
  def TableCoerce.to_boolean(val)
    return val if val == true || val == false
    raise 'Cannot coerce to boolean' unless val.is_a?(String)
    return true if !TRUE.match(val).nil?
    return false if !FALSE.match(val).nil?
    raise 'Cannot coerce to boolean'
  end

  # @param val [String|Boolean|Number]
  def TableCoerce.number?(val)
    return true if val.is_a?(Numeric)
    return false unless val.is_a?(String)
    # TODO - doesnt work on things like 1,234
    return !NUMBER.match(val).nil?
  end

  # converts a value to a number, throwing if unable to do so
  def TableCoerce.to_number(val)
    return val if val.is_a?(Numeric)
    raise 'Cannot coerce to number' unless val.is_a?(String) && NUMBER.match(val)
    new_val = val.to_f
    new_val = new_val.to_i if new_val.to_i == new_val
    new_val
  end

end
