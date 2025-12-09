# frozen_string_literal: true

# # Localizable
#
# A concern that provides automatic localization for specified model attributes.
# Uses I18n with smart fallbacks to the original attribute values when translations
# are missing or the locale is invalid.
#
# ## Setup
# Include the concern and define which attributes should be localizable:
#
#   class CourseOffering < ApplicationRecord
#     include Localizable
#     self.localizable_attributes = :display_name, :description
#   end
#
# ## I18n Structure
# Translations are expected at: data.<model_plural>.<object_key>.<attribute>
# Example: data.course_offerings.csp.display_name
#
# ## Usage
# External usage - call on model instances
#   course = CourseOffering.find_by(key: 'csp')
#   course.localized_display_name                                    # Uses current I18n.locale
#   course.localized_display_name('es')                              # Specify locale explicitly
#   course.localized_display_name('es', key_override: 'custom-key')  # Override lookup key
#   course.localized_display_name_with_options(locale: 'es', key: 'custom-key')
#
#   # Internal usage - within the model itself
#   class CourseOffering < ApplicationRecord
#     include Localizable
#     self.localizable_attributes = :display_name, :description
#
#     def formatted_title
#       "Course: #{localized_display_name}"
#     end
#
#    def summarize_for_show
#       {
#         key: key,
#         display_name: localized_display_name,
#         header: formatted_title,
#         description: localized_description,
#       }
#     end
#   end
#
# ## Features
# - Automatic method generation for configured attributes
# - Smart caching with cache invalidation
# - Graceful fallback to original values
# - Error handling for invalid locales
# - Validation of configured attributes

module Localizable
  extend ActiveSupport::Concern

  included do
    after_initialize :setup_localization_cache
  end

  class_methods do
    def localizable_attributes
      @localizable_attributes || []
    end

    # Class method to define localizable attributes
    def localizable_attributes=(attrs)
      @localizable_attributes = Array(attrs).map(&:to_sym)

      # Generate localized_* methods for each configured attribute
      @localizable_attributes.each do |attr|
        define_method("localized_#{attr}") do |locale_code = I18n.locale, key_override: nil|
          localize_property(attr, locale_code:, key_override:)
        end

        # Also create a method that accepts options hash (for backward compatibility)
        define_method("localized_#{attr}_with_options") do |options = {}|
          locale_code = options[:locale] || options[:locale_code] || I18n.locale
          key_override = options[:key]
          localize_property(attr, locale_code:, key_override:)
        end
      end
    end

    # Helper to check if a class has any localizable attributes
    def has_localizable_attributes?
      localizable_attributes.any?
    end
  end

  # Main localization method
  def localize_property(property_name, locale_code: I18n.locale, key_override: nil)
    property_name = property_name.to_sym
    cache_key = "#{property_name}_#{locale_code}"

    # Validate that the property is configured as localizable
    unless self.class.localizable_attributes.include?(property_name)
      CDO.log.warn("Attempting to localize non-configured attribute #{property_name} on #{self.class.name}")
      return try(property_name)
    end

    # Get the fallback value (original property value)
    fallback_value = fallback_value_for(property_name)
    # Return nil immediately if the fallback is nil (don't try to localize nil values)
    if fallback_value.blank?
      @localization_cache[cache_key] = nil if @localization_cache
      return nil
    end

    # Return fallback if we're using the default locale
    return fallback_value if locale_code.to_s == I18n.default_locale.to_s

    # Return memoize translation if it exists
    return @localization_cache[cache_key] if @localization_cache&.key?(cache_key)

    # Determine lookup key: use override if provided, otherwise use object.key
    lookup_key = key_override.presence || try(:key)

    result = if lookup_key.blank?
               fallback_value
             else
               perform_i18n_lookup(property_name, fallback_value, locale_code, lookup_key)
             end

    # Cache the translation
    @localization_cache[cache_key] = result if @localization_cache
    result
  end

  # Check if this instance uses localization
  def uses_localization?
    self.class.has_localizable_attributes?
  end

  # Clear localization cache (useful after updates)
  def clear_localization_cache!
    @localization_cache&.clear
  end

  private def fallback_value_for(property_name)
    return public_send(property_name) if respond_to?(property_name)

    # Handle cases where the attribute might not exist
    CDO.log.warn("Property #{property_name} not found on #{self.class.name}")
    nil
  end

  private def setup_localization_cache
    @localization_cache = {}
  end

  # Perform the actual I18n lookup with error handling
  private def perform_i18n_lookup(property_name, fallback_value, locale_code, lookup_key)
    I18n.with_locale(locale_code) do
      I18n.t(
        property_name,
        scope: [:data, self.class.model_name.plural, lookup_key],
        default: fallback_value,
        smart: true
      )
    end
  rescue => exception
    CDO.log.error("Localization error for #{self.class.name}##{property_name} (locale: #{locale_code}): #{exception.message}")
    fallback_value
  end
end
