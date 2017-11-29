require lib_dir 'utf8mb4_extensions'

module CoreExtensions
  module Hash
    module Camelizing
      def camelize_keys
        ::Hash[map {|key, value| [key.to_s.camelize(:lower), value]}]
      end
    end
  end
end

Hash.send(:include, CoreExtensions::Hash::Camelizing)

module CoreExtensions
  module I18n
    module En
      def en?
        locale && locale.to_s[0..1] == 'en'
      end
    end
  end
end

I18n.send(:extend, CoreExtensions::I18n::En)
