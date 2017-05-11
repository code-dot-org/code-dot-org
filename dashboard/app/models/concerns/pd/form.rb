module Pd::Form
  extend ActiveSupport::Concern

  included do
    validates_presence_of :form_data
    validate :validate_required_fields
    validate :validate_options
  end

  module ClassMethods
    def options
      # should be overridden by including model
      {}
    end

    def required_fields
      # should be overridden by including model
      []
    end
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
      value.empty?
    end

    self.class.required_fields.each do |key|
      add_key_error(key) unless hash.key?(key)
    end
  end

  def validate_options
    hash = sanitize_form_data_hash

    hash_with_options = hash.select do |key, _|
      self.class.options.key? key
    end

    hash_with_options.each do |key, value|
      if value.is_a? Array
        value.each do |subvalue|
          add_key_error(key) unless self.class.options[key].include? subvalue
        end
      else
        add_key_error(key) unless self.class.options[key].include? value
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
end
