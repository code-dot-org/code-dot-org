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

  # Determine if this (unsaved) model is a duplicate of an existing saved form.
  # Used for idempotence check by controller
  # @return [nil|Form] existing form that this is a duplicate of, or nil.
  def check_idempotency
    # override in model to provide an idempotence check
    nil
  end

  # Dynamic options are only used for validation on the server.
  # They are not supplied to the client like #options.
  def dynamic_options
    # should be overridden by including in model
    {}
  end

  # Dynamic require fields are only used for validation on the server.
  # They are not supplied to the client like #required_fields.
  # Use for conditionally required fields, such as those that are dependent on other answers
  def dynamic_required_fields(sanitized_form_data_hash)
    # should be overridden by including in model
    []
  end

  def add_key_error(key)
    key = key.to_s.camelize(:lower)
    errors.add(:form_data, :invalid, message: key)
  end

  def validate_required_fields
    # The form data should be considered valid (regardless of whether or not it contains data) if
    # its owner has been deleted.
    return if owner_deleted?

    hash = sanitize_and_trim_form_data_hash

    self.class.required_fields.each do |key|
      add_key_error(key) unless hash.key?(key)
    end

    dynamic_required_fields(hash).each do |key|
      add_key_error(key) unless hash.key?(key)
    end
  end

  def validate_options
    # The form data should be considered valid (regardless of whether or not it contains data) if
    # its owner has been deleted.
    return if owner_deleted?

    validate_with self.class.options
    validate_with dynamic_options
  end

  def validate_with(options)
    hash = sanitize_and_trim_form_data_hash

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
    self.form_data = hash.to_json
  end

  def form_data_hash
    @form_data_hash ||=
      form_data ? JSON.parse(form_data) : {}
  end

  def sanitize_form_data_hash
    @sanitized_form_data_hash ||=
      form_data_hash.transform_keys {|key| key.underscore.to_sym}
  end

  def sanitize_and_trim_form_data_hash
    # empty fields may come about when the user selects then unselects an
    # option. They should be treated as if they do not exist
    @sanitized_and_trimmed_form_data_hash ||=
      sanitize_form_data_hash.reject do |_, value|
        value.blank?
      end
  end

  def public_sanitized_form_data_hash
    @public_sanitized_form_data_hash ||=
      sanitize_form_data_hash.select {|key| self.class.public_fields.include? key}
  end

  def form_data=(json)
    write_attribute :form_data, json
    clear_memoized_values
  end

  def clear_form_data
    self.form_data = {}.to_json
  end

  def reload
    super.tap do
      clear_memoized_values
    end
  end

  def clear_memoized_values
    @form_data_hash = nil
    @sanitized_form_data_hash = nil
    @sanitized_and_trimmed_form_data_hash = nil
    @public_sanitized_form_data_hash = nil
  end

  # Returns whether the owner of the form (through an associated user_id or pd_enrollment_id) has
  # been deleted. This method should be override by classes implementing this concern.
  # @return [Boolean] Whether the owner of the form has been deleted.
  def owner_deleted?
    false
  end
end
