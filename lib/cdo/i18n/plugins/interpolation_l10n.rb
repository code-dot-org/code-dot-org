require 'i18n'
require 'twitter_cldr'

module Cdo
  module I18n
    module Plugins
      module InterpolationL10n
        NUMBER_PATTERN = /^\d+(\.\d+)?$/ # Matches integers and floating-point numbers, e.g., "1" or "1.0"
        DIGIT_GROUP_SEPARATOR = ',' # The character used to group digits in numbers, e.g., "1,000"

        # Localizes Western Arabic numbers, e.g., "1234.5678" to "۱٬۲۳۴٫۵۶۷۸" for "fa-IR".
        # @param locale [String|Symbol] The locale
        # @param value [String] The value to localize
        # @return [String] The localized value
        protected def localize_number(locale, value)
          value.to_s.sub(NUMBER_PATTERN) do |number|
            formatted_number = number.include?('.') ? number.to_f : number.to_i
            TwitterCldr::Localized::LocalizedNumber.new(formatted_number, locale).to_s.delete(DIGIT_GROUP_SEPARATOR)
          end
        rescue StandardError
          value
        end

        protected def localize_interpolation_values(locale, values)
          return values unless values.is_a?(Hash) && !values.empty?

          values.transform_values do |value|
            value = localize_number(locale, value)
            value
          end
        end

        # Overrides the protected method +I18n::Backend::Base#interpolate+ to localize interpolation values.
        # @see https://github.com/ruby-i18n/i18n/blob/v1.14.1/lib/i18n/backend/base.rb#L181-L200
        protected def interpolate(locale, subject, values = ::I18n::EMPTY_HASH)
          super locale, subject, localize_interpolation_values(locale, values)
        rescue StandardError
          super
        end

        # Overrides the protected method +I18n::Backend::Base#deep_interpolate+ to localize interpolation values.
        # @see https://github.com/ruby-i18n/i18n/blob/v1.14.1/lib/i18n/backend/base.rb#L202-L224
        protected def deep_interpolate(locale, data, values = ::I18n::EMPTY_HASH)
          super locale, data, localize_interpolation_values(locale, values)
        rescue StandardError
          super
        end
      end
    end
  end
end
