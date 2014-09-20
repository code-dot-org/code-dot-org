class Object

  # Returns true if nil or empty (string, array, hash)
  def nil_or_empty?()
    self.nil? || self.empty?
  end
  
  # Return the value to use in a querystring/form.
  unless method_defined?(:to_param)  # May be provided by Rails
    def to_param
      to_s
    end
  end

  # Return the value encoded as a querystring/form property (key=value)
  unless method_defined?(:to_query)  # May be provided by Rails
    def to_query(key)
      "#{Rack::Utils.escape(key.to_param)}=#{Rack::Utils.escape(to_param.to_s)}"
    end
  end

end
