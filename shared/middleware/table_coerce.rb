module TableCoerce
  def TableCoerce.coerce(records, columns)
    # first do a pass to determine types. we can't do coercion right away since
    # we dont want to change anything if we cant coerce the entire column
    # begin with no type definitions
    column_types = TableCoerce.column_types(records, columns)

    # second pass to convert values. by default, values are all strings
    records.each do |row|
      columns.each_index do |index|
        type = column_types[index]
        col = columns[index]
        val = row[col.to_sym]
        if type == :boolean
          row[col.to_sym] = TableCoerce.to_boolean(val)
        elsif type == :number
          row[col.to_sym] = TableCoerce.to_number(val)
        end
      end
    end

    records
  end

  def TableCoerce.column_types(records, columns)
    # do an initial pass to determine column types
    return columns.map do |col|
      if records.length == 0
        :string
      elsif !records.any? { |record| !TableCoerce.is_boolean?(record[col.to_sym]) }
        :boolean
      elsif !records.any? { |record| !TableCoerce.is_number?(record[col.to_sym]) }
        :number
      else
        :string
      end
    end
  end

  # @param val [String|Boolean|Number]
  def TableCoerce.is_boolean?(val)
    return true if val == true || val == false
    return false unless val.is_a?(String)
    return !/true/i.match(val).nil? || !/false/i.match(val).nil?
  end

  def TableCoerce.to_boolean(val)
    return val if val == true || val == false
    raise 'Cannot coerce to boolean' unless val.is_a?(String)
    return true if !/true/i.match(val).nil?
    return false if !/false/i.match(val).nil?
    raise 'Cannot coerce to boolean'
  end

  # @param val [String|Boolean|Number]
  def TableCoerce.is_number?(val)
    return true if val.is_a?(Numeric)
    return false unless val.is_a?(String)
    # TODO - doesnt work on things like 1,234
    return !/\A[-+]?[0-9]*\.?[0-9]+\Z/.match(val).nil?
  end

  def TableCoerce.to_number(val)
    return val if val.is_a?(Numeric)
    raise 'Cannot coerce to number' unless val.is_a?(String) && /\A[-+]?[0-9]*\.?[0-9]+\Z/.match(val)
    new_val = val.to_f
    new_val = new_val.to_i if new_val.to_i == new_val
    new_val
  end

end
