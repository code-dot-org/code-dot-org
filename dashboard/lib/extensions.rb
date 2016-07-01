module CoreExtensions
  module Hash
    module Camelizing
      def camelize_keys
        ::Hash[self.map{|key, value| [key.to_s.camelize(:lower), value]}]
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

module CoreExtensions
  module String
    module Utf8mb4
      def utf8mb4?
        chars.each do |char|
          if char.bytes.length >= 4
            return true
          end
        end
        false
      end
    end
  end
end
String.send(:include, CoreExtensions::String::Utf8mb4)
