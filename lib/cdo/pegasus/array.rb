class Array
  
  # Return the array in http querystring/form format
  unless method_defined?(:to_query) # May be provided by Rails
    def to_query(key)
      prefix = "#{key}[]"
      collect { |value| value.to_query(prefix) }.join '&'
    end
  end

end
