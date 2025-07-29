# Super-WIP module that implements a bespoke DSL (domain specific language) that I'm simply
# calling RubyTypes.  This DSL was designed to mimic defining TypeScript types in a way that
# will raise a runtime error when using a type incorrectly.  As the main goal of this code is
# to provide a TypeScript-like experience when defining types, much of this file may be
# unconventional (non-idiomatic).  This file should probably be moved from helpers, which
# will eliminate some things needed to get around rubocop settings in the helper directory.

module AichatRubyTypes
  def self.stringify(value)
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

  class Type
    def |(other)
      OrType.new(self, other)
    end

    def []
      ArrayType.new(self)
    end

    def type_string
      to_s
    end

    def value_is_type?(value)
      raise StandardError.new("not implmemented")
    end

    def assert_value_is_type(value, key = nil)
      raise StandardError.new("#{AichatRubyTypes.stringify(value)} does not match type: #{type_string}#{key.nil? ? "" : " for key=#{key}"}") unless value_is_type?(value)
    end
  end

  def self.assert_value_is_type(value, type, key = nil)
    if type.is_a?(Class)
      # TODO - is it possible to dedup this?
      raise StandardError.new("#{AichatRubyTypes.stringify_local.call(value)} does not match type: #{type}#{key.nil? ? "" : " for key=#{key}"}") unless value.is_a?(type)
    else
      type.assert_value_is_type(value, key)
    end
  end

  module TypeOperators
    def self.included(base)
      base.extend(ClassMethods)
    end

    module ClassMethods
      # TODO - is it possible to dedup this with Type above?
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

  define_method(
    :InterfaceType,
    lambda do |*fields_and_types|
      fields = []
      types = {}

      fields_and_types.each_slice(2) do |field, type|
        raise StandardError.new("interface must be created with even number of properties and types") if type.nil?
        fields << field
        types[field] = type
      end

      Class.new(Struct.new(*fields, keyword_init: true)) do
        include TypeOperators
        @types = types

        class << self
          attr_reader :types
        end

        def initialize(**kwargs)
          types = self.class.types

          types.each do |name, type|
            AichatRubyTypes.assert_value_is_type(kwargs[name], type, name)
          end
          super(**kwargs)
        end
      end
    end
  )

  class OptionalType < Type
    attr_accessor :type

    def type_string
      "#{type.type_string}?"
    end

    def initialize(type)
      @type = type
    end

    def value_is_type?(value)
      value.nil? ||  @type.value_is_type?(value)
    end
  end

  define_method(
    :Optional,
    lambda do |type|
      OptionalType.new(type)
    end
  )

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

  def string(string_contents = nil)
    StringType.new(string_contents)
  end

  class NumberType < Type
    def type_string
      'number'
    end

    def value_is_type?(value)
      value.is_a?(Numeric)
    end
  end

  def number
    NumberType.new
  end

  module_function :string, :number, :Optional, :InterfaceType
end
