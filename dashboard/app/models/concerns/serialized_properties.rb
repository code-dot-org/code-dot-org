# Defines methods to access properties in a property bag via a serialized_attrs declaration
module SerializedProperties
  extend ActiveSupport::Concern
  included do
    serialize :properties, JSON
    class_attribute :serialized_properties
    self.serialized_properties ||= {}

    after_initialize :init_properties
    before_save { properties.select! { |_, v| v.present? } }
  end

  def assign_attributes(new_attributes)
    init_properties
    attributes = new_attributes.stringify_keys
    new_properties = attributes.delete('properties').try(:stringify_keys!)
    super(attributes)
    # If the properties hash is explicitly assigned then merge its keys with existing properties
    # instead of replacing the entire hash
    super(properties: properties.merge(new_properties)) if new_properties
  end

  def init_internals
    self.class.init_internals
    super
  end

  module ClassMethods
    def sti_hierarchy
      classes = []
      clazz = self
      while clazz != ActiveRecord::Base
        classes << clazz
        clazz = clazz.superclass
      end
      classes
    end

    def serialized_attrs(*args)
      (serialized_properties[self.to_s] ||= []).concat args
    end

    def define_methods_for_property(property_name)
      define_method(property_name) { read_attribute('properties')[property_name] }
      define_method("#{property_name}=") { |value| read_attribute('properties')[property_name] = value }
      define_method("#{property_name}?") { read_attribute('properties')[property_name] }
    end

    ENCRYPTED_PROPERTY_REGEX = /^encrypted_/

    def define_methods_for_encrypted_property(property_name)
      cleartext_property_name = property_name.gsub(ENCRYPTED_PROPERTY_REGEX, '')

      define_method(cleartext_property_name) do
        begin
          Encryption::decrypt_object(read_attribute('properties')[property_name])
        rescue OpenSSL::Cipher::CipherError, Encryption::KeyMissingError
          return nil
        end
      end

      define_method("#{cleartext_property_name}=") do |value|
        read_attribute('properties')[property_name] = Encryption::encrypt_object(value)
      end

      define_method("#{cleartext_property_name}?") do
        # same as the getter without ?
        self.send(cleartext_property_name)
      end
    end

    def init_internals
      sti_hierarchy.map { |x| serialized_properties[x.to_s] || [] }.flatten.each do |property|
        property = property.to_s
        if property =~ ENCRYPTED_PROPERTY_REGEX
          define_methods_for_encrypted_property property
        else
          define_methods_for_property property
        end
      end
    end
  end

  private
  def init_properties
    write_attribute('properties', {}) unless read_attribute('properties')
  end

end
