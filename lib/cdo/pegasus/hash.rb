class Hash

  def self.from_keys_and_values(keys, values)
    h={}
    for i in 0..keys.count-1
      h[keys[i]] = values[i]
    end
    h
  end

  def slice_keys(*keys)
    h = {}
    each_pair do |key, value|
      next unless keys.include?(key)
      h[key] = value
    end
    h
  end

  unless method_defined?(:to_param)
    def to_param(namespace = nil)
      collect do |key, value|
        value.to_query(namespace ? "#{namespace}[#{key}]" : key)
      end.sort * '&'
    end
  end
  alias_method :to_query, :to_param unless method_defined?(:to_query)

end
