class Hash
  def deep_sort(&block)
    keys.sort(&block).reduce({}) do |seed, key|
      seed[key] = self[key]
      if seed[key].is_a?(Hash)
        seed[key] = seed[key].deep_sort(&block)
      end
      seed
    end
  end
end
