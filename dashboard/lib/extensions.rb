module CoreExtensions
  module Hash
    module Camelizing
      def camelize_keys
        ::Hash[self.map{|key, value|[key.to_s.camelize(:lower), value]}]
      end
    end
  end
end

Hash.send(:include, CoreExtensions::Hash::Camelizing)
