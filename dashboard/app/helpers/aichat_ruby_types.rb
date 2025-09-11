require "ostruct"

# Super-WIP module that implements a bespoke DSL (domain specific language) that I'm simply
# calling RubyTypes.  This DSL was designed to mimic defining TypeScript types in a way that
# will raise a runtime error when using a type incorrectly.  As the main goal of this code is
# to provide a TypeScript-like experience when defining types, much of this file may be
# unconventional (non-idiomatic).  This file should probably be moved from helpers, which
# will eliminate some things needed to get around rubocop settings in the helper directory.

module AichatRubyTypes
  # Notify if production or raise an exception otherwise.
  def self.raise_or_notify_type_error(message)
    if rack_env?(:production)
      Honeybadger.notify(
        error_class: AichatRubyTypesWarning,
        error_message: message
      )
    else
      raise StandardError.new(message)
    end
  end

  # Stringify the type of a value.
  def self.stringify_type(value)
    if value.nil?
      return "nil"
    elsif value.is_a?(Class)
      if value.is_a?(String)
        return "\"#{value}\""
      elsif value.is_a?(Numeric)
        return value.to_s
      end
    else
      value.to_s
    end
  end

  # Base class for types.
  class Type
    # Allow types to be ORed with another type using TypeSctipt's `|` between types.
    def |(other)
      OrType.new(self, other)
    end

    # Allow types to be used as array item types using TypeSctipt's `[]` after a type.
    def []
      ArrayType.new(self)
    end

    # Turn a type into a string for error messages.  Default to ruby's built-in `to_s`
    def type_string
      to_s
    end

    # Helper to determint if a value is this type. Needs to be implemented in derived classes.
    def value_is_type?(value)
      raise_or_notify_type_error("not implmemented")
    end

    # Assert whether a value is this type.  Relies on `value_is_type?` helper.
    def assert_value_is_type(value, key = nil)
      raise_or_notify_type_error("#{AichatRubyTypes.stringify_type(value)} does not match type: #{type_string}#{key.nil? ? "" : " for key=#{key}"}") unless value_is_type?(value)
    end
  end

  # Assert whether a value is a given type.
  def self.assert_value_is_type(value, type, key = nil)
    # For Interfaces, the type is actually a struct not an instance of struct,
    # so we use is_a?(Class to catch this case.
    if type.is_a?(Class)
      # If an interface, we check that the value is an instance of that stuct.
      raise_or_notify_type_error("#{AichatRubyTypes.stringify_type(value)} does not match type: #{type}#{key.nil? ? "" : " for key=#{key}"}") unless value.is_a?(type)

    # For all instances of Type-derived classes, we call its assert_value_is_type
    # to do the assertion.
    elsif type.is_a?(Type)
      # For instances of types (should be derived from `Type`)
      type.assert_value_is_type(value, key)
    else
      # Any other Type is unexpected.
      raise_or_notify_type_error("Tried to assert value is a type, with an unexpected type: #{type}")
    end
  end

  # These are the methods we need to add to Interface which is different
  # from Type.  Type-derived classes are compared to values as instances
  # (StringType, NumberType, OrType) but Interface is compared directly (not instantiated).
  module InterfaceMethods
    def as_json(*_args)
      # Convert Struct/OpenStruct to a hash, removing nil values.
      # I.e. Optional() becomes nil but should be removed from JSON)
      to_h.compact
    end

    # Add struct methods when creating an Interface.
    def self.included(base)
      base.extend(StructMethods)
    end

    # Struct methods we add to the interface.  These are essentially deplicates
    # of what are defined on the Type base class.
    # TODO - is it possible to dedup this with Type.
    module StructMethods
      def |(other)
        OrType.new(self, other)
      end

      def []
        ArrayType.new(self)
      end

      def value_is_type?(value)
        value.is_a?(self)
      end

      def type_string
        name
      end
    end
  end

  # Special helper to simulate TypeScript index signatures.  These are limited
  # to the signature and a further key can not be defined to be more constrained.
  # Not used directly. The key function will return an instance.
  #
  # TypeScript:
  #  interface SimpleProperties {
  #    [key: string]: SimplePropertySchema | SimpleArraySchema | SimpleObjectSchema;
  #  }
  # Ruby:
  #   SimpleProperties = Interface(
  #    key[string],  SimplePropertySchema | SimpleArraySchema | SimpleObjectSchema
  #  )
  class KeyType
    attr_reader :type

    def [](type)
      @type = type
      self
    end
  end

  # Returns an instance of KeyType to be used like
  # `key[string]` to emulate `[key: string]`.
  def key
    KeyType.new
  end

  # We technically can't define a type (really a constant)
  # after using it so this is a problem with any circular
  # references.  So we have to create a forward ref in these
  # cases.
  class ForwardRefType < Type
    attr_accessor :type

    def type_string
      "#{@type.type_string}?"
    end

    def value_is_type?(value)
      @type.value_is_type?(value)
    end
  end

  class ForwardRefToImplement
    attr_accessor :forward_ref

    def initialize(forward_ref)
      @forward_ref = forward_ref
    end
  end

  # The ForwardRef/ForwardRef() function to return an instance of ForwardRefType.
  # We use a lambda to get around rubocops insistence that methods need to be snake-case.
  define_method(
    :ForwardRef,
    lambda do |type = nil|
      if type.nil?
        # If called with no type create a forward ref.
        ForwardRefType.new
      else
        # Otherwise, wrap the ref to signal to Interface that it is implementing
        # the forward ref and needs to add the type.  We'll check if the first
        # param to Interface is ForwardRefToImplement.
        ForwardRefToImplement.new(type)
      end
    end
  )

  # Interface is a function that takes property names and types and creates a new "struct-derived"
  # class that will then automate type assertion whenever a new instance of the struct is created.
  # We use a lambda to get around rubocops insistence that methods need to be snake-case.
  define_method(
    :Interface,
  lambda do |*fields_and_types|
    fields = []
    types = {}

    # Signal that we should complete the forward ref
    if fields_and_types[0].is_a?(ForwardRefToImplement)
      forward_ref = fields_and_types[0].forward_ref
      # Remove the first item since the first value is the forward ref.
      fields_and_types.shift
    end

    # If we passed in a key[SomeType] then we have a special case of index signatures
    # where we allow any number of key/value pairs as long as the key and type match
    # e.g.
    # SimpleProperties = Interface(
    #   key[SomeType],  SomeOtherType
    # )
    if fields_and_types[0].is_a?(KeyType)
      key_type = fields_and_types[0]
      value_type = fields_and_types[1]

      if fields_and_types.length == 1
        raise_or_notify_type_error("interface is missing value for index signature key[#{key_type.type}],  missingOtherType")
      elsif fields_and_types.length > 2
        raise_or_notify_type_error("interface with index signature can not have further keys to be further constrained")
      elsif !key_type.type.is_a?(StringType)
        raise_or_notify_type_error("interface with index signature can only be set with key[string] (i.e. symbol in ruby)")
      end

      # Create and return the actual open struct-derived class.
      new_class = Class.new(OpenStruct) do
        include InterfaceMethods
        @value_type = value_type

        class << self
          attr_reader :value_type
        end

        # Initialize the struct based on keyword args, asserting that values for each of the
        # args matches the type signature.
        def initialize(**kwargs)
          value_type = self.class.value_type

          kwargs.each do |name, value|
            AichatRubyTypes.assert_value_is_type(value, value_type, name)
          end
          super(**kwargs)
        end
      end

      forward_ref.type = new_class if forward_ref

      new_class

    else

      # Every even parameter is the field (property) name, and every odd is the type.
      # Iterate through them and build an array of field names and a hash of field name
      # to type.
      fields_and_types.each_slice(2) do |field, type|
        raise_or_notify_type_error("interface must be created with even number of properties and types") if type.nil?
        fields << field
        types[field] = type
      end

      # Create and return the actual struct-derived class.
      new_class = Class.new(Struct.new(*fields, keyword_init: true)) do
        include InterfaceMethods
        @types = types

        class << self
          attr_reader :types
        end

        # Initialize the stuct based on keyword args, asserting that values for each of the
        # expected types is present and is the correct type.
        def initialize(**kwargs)
          types = self.class.types

          types.each do |name, type|
            AichatRubyTypes.assert_value_is_type(kwargs[name], type, name)
          end
          super(**kwargs)
        end
      end

      forward_ref.type = new_class if forward_ref

      new_class

    end
  end
)

  # An optional type. Not used directly.  The Optional() function returns an instance.
  class OptionalType < Type
    attr_accessor :type

    def type_string
      "#{@type.type_string}?"
    end

    def initialize(type)
      @type = type
    end

    def value_is_type?(value)
      value.nil? ||  @type.value_is_type?(value)
    end
  end

  # The Optional() function to return an instance of OptionalType.
  # We use a lambda to get around rubocops insistence that methods need to by snake-case.
  #TODO - make optional args with ? instead of Optional() e.g. arg?, number
  define_method(
    :Optional,
    lambda do |type|
      OptionalType.new(type)
    end
  )

  # An ORing of two types. Not used directly.  The `|` operator returns an instance.
  class OrType < Type
    attr_accessor :first_type, :second_type

    def type_string
      "(#{@first_type.type_string} | #{@second_type.type_string})"
    end

    def initialize(first_type, second_type)
      @first_type = first_type
      @second_type = second_type
    end

    def value_is_type?(value)
      @first_type.value_is_type?(value) ||  @second_type.value_is_type?(value)
    end
  end

  # An array of a given type. Not used directly.  The `[]` operator returns an instance.
  class ArrayType < Type
    attr_accessor :type

    def type_string
      "#{@type.type_string}[]"
    end

    def initialize(type)
      @type = type
    end

    def value_is_type?(value)
      value.is_a?(Array) && value.all? do |item|
        @type.is_a?(Class) ? item.is_a?(@type) : @type.value_is_type?(item)
      end
    end
  end

  # A string type.  Can be initialized to accept all strings (no parameter)
  # or a given string (string as parameter). Not used directly.  The string
  # function returns an instance.
  class StringType < Type
    attr_accessor :string_contents

    def type_string
      @string_contents.nil? ? 'string' : "\"#{@string_contents}\""
    end

    def initialize(string_contents = nil)
      @string_contents = string_contents
    end

    def value_is_type?(value)
      value.is_a?(String) && (@string_contents.nil? || @string_contents == value)
    end
  end

  # The string function to return an instance of StringType.
  def string(string_contents = nil)
    StringType.new(string_contents)
  end

  # A number type.  Not used directly.  The number function returns an instance.
  class NumberType < Type
    def type_string
      'number'
    end

    def value_is_type?(value)
      value.is_a?(Numeric)
    end
  end

  # The number function to return an instance of NumberType.
  def number
    NumberType.new
  end

  # A boolean type.  Can be initialized to accept either true or false (no parameter)
  # or a given value (boolean as parameter). Not used directly.  The boolean
  # function returns an instance.
  class BooleanType < Type
    attr_accessor :boolean_contents

    def type_string
      @boolean_contents.nil? ? 'boolean' : @boolean_contents.to_s
    end

    def initialize(boolean_contents = nil)
      @boolean_contents = boolean_contents
    end

    def value_is_type?(value)
      (value.is_a?(TrueClass) || value.is_a?(FalseClass)) && (@boolean_contents.nil? || @boolean_contents == value)
    end
  end

  # The boolean function to return an instance of BooleanType.
  def boolean(boolean_contents = nil)
    BooleanType.new(boolean_contents)
  end

  # A null (nil) type.  Not used directly.  The null function returns an instance.
  class NullType < Type
    def type_string
      'null'
    end

    def value_is_type?(value)
      value.is_a?(NilClass)
    end
  end

  # The null function to return an instance of NullType.
  def null
    NullType.new
  end

  module_function :string, :number, :boolean, :null, :key, :Optional, :Interface, :ForwardRef
end
