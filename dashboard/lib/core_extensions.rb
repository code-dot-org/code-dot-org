require lib_dir 'utf8mb4_extensions'

module CoreExtensions
  module Hash
    module Camelizing
      def camelize_keys
        transform_keys {|key| key.to_s.camelize(:lower)}
      end
    end
  end

  module I18n
    module En
      def en?
        locale && locale.to_s[0..1] == 'en'
      end
    end
  end
end

Hash.include CoreExtensions::Hash::Camelizing
I18n.extend CoreExtensions::I18n::En
