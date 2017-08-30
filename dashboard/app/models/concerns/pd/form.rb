module Pd::Form
  extend ActiveSupport::Concern

  included do
    validates_presence_of :form_data
    validate :validate_required_fields, if: :form_data_changed?
    validate :validate_options, if: :form_data_changed?
  end

  module ClassMethods
    # Options supplied to the client for rendering,
    # and used for validation on the server.
    def options
      # should be overridden by including model
      {}
    end

    def public_fields
      # should be overridden by including model
      []
    end

    def required_fields
      # should be overridden by including model
      []
    end

    def camelize_required_fields
      camelize_fields required_fields
    end

    def camelize_fields(fields)
      fields.map {|s| s.to_s.camelize :lower}
    end
  end

  # Dynamic options are only used for validation on the server.
  # They are not supplied to the client like #options.
  def dynamic_options
    # should be overridden by including in model
    {}
  end

  def add_key_error(key)
    key = key.to_s.camelize(:lower)
    errors.add(:form_data, :invalid, message: key)
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    # empty fields may come about when the user selects then unselects an
    # option. They should be treated as if they do not exist
    hash.delete_if do |_, value|
      value.blank?
    end

    self.class.required_fields.each do |key|
      add_key_error(key) unless hash.key?(key)
    end
  end

  def validate_options
    validate_with self.class.options
    validate_with dynamic_options
  end

  def validate_with(options)
    hash = sanitize_form_data_hash

    hash_with_options = hash.select do |key, _|
      options.key? key
    end

    hash_with_options.each do |key, value|
      if value.is_a? Array
        value.each do |subvalue|
          add_key_error(key) unless options[key].try(:include?, subvalue)
        end
      elsif value.is_a? Hash
        value.each do |_key, subvalue|
          add_key_error(key) unless options[key].try(:include?, subvalue)
        end
      else
        add_key_error(key) unless options[key].try(:include?, value)
      end
    end
  end

  def update_form_data_hash(update_hash)
    self.form_data_hash = form_data_hash.merge update_hash
  end

  def form_data_hash=(hash)
    write_attribute :form_data, hash.to_json
  end

  def form_data_hash
    form_data ? JSON.parse(form_data) : {}
  end

  def sanitize_form_data_hash
    form_data_hash.transform_keys {|key| key.underscore.to_sym}
  end

  def public_sanitized_form_data_hash
    sanitize_form_data_hash.select {|key| self.class.public_fields.include? key}
  end

  def clear_form_data
    write_attribute :form_data, {}.to_json
  end
end
