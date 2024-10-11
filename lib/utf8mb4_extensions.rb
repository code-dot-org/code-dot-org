module CoreExtensions
  module String
    module Utf8mb4
      def utf8mb4?
        chars.each do |char|
          if char.bytesize >= 4
            return true
          end
        end
        false
      end

      def strip_utf8mb4
        chars.delete_if do |char|
          char.bytesize >= 4
        end.join
      end

      def sanitize_utf8mb4
        chars.map do |char|
          if char.bytesize >= 4
            '?'
          else
            char
          end
        end.join
      end
    end
  end
end

String.include CoreExtensions::String::Utf8mb4
