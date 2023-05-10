require 'singleton'
require 'delegate'
require 'cdo/yaml'

module Cdo
  # Loads and combines structured application configuration settings.
  class Config
    def initialize
      @table = {}
    end

    # Converts the Config object to a hash
    def to_h
      @table.dup
    end

    # Computes a hash code for this Config object.
    def hash
      @table.hash
    end

    # Returns the value of an attribute, or `nil` if there is no such attribute.
    def [](name)
      @table[name.to_sym]
    end

    # Returns `true` if the given name is a configuration key
    def key?(name)
      @table.key?(name.to_sym)
    end

    # Implement our own soft-freeze: Don't allow any config items to be
    # created/modified, but allow stubbing for unit tests.
    def freeze_config
      @frozen = true
    end

    # Inspired by OpenStruct; if unfrozen, allow assigning new configuration
    # values with `=` and default undefined values to nil
    # See https://github.com/ruby/ostruct/blob/e61b4464a033c38a65657eaf0467d12e2c7b9ec1/lib/ostruct.rb#L207-L229
    def method_missing(mid, *args)
      raise ArgumentError, "Undefined #{self.class} reference: #{mid}", caller(1) if @frozen

      len = args.length
      if mname = mid[/.*(?==\z)/m]
        if len != 1
          raise ArgumentError, "wrong number of arguments (given #{len}, expected 1)", caller(1)
        end
        load_configuration({mname => args[0]})
      elsif len == 0
        return nil
      else
        super
      end
    end

    # Because we override `method_missing`, also update `respond_to_missing?`
    def respond_to_missing?(mid, include_all)
      key?(mid) || super
    end

    # Loads one or several sources into the merged configuration.
    # Resolves dynamic config self-references by re-rendering + merging until result is unchanged.
    def load_configuration(*sources)
      raise RuntimeError, "can't modify frozen #{self.class}", caller(2) if @frozen

      config = nil
      i = 8
      table = @table
      while config != (config = render(*sources))
        raise "Can't resolve config (circular dependency?)" if (i -= 1).zero?
        @table = table.dup
        config.each(&method(:merge))
      end
    end

    # Renders config source into a hash, loading ERB/YAML files based on extension.
    def render(*sources)
      sources.map do |source|
        if source.is_a?(Hash)
          source
        elsif File.extname(source) == '.yml'
          YAML.load_file(source) || {}
        elsif File.extname(source) == '.erb'
          YAML.load_erb_file(source, binding) || {}
        end.transform_keys(&:to_sym)
      end
    end

    # Merge the provided config hash into the current config.
    def merge(config)
      return if config.nil?

      # 'Reverse-merge' keeps existing values.
      @table.merge!(config) {|_key, old, _new| old}

      # Add an accessor method for each new key/value pair
      config.keys.each do |key|
        unless singleton_class.method_defined?(key)
          define_singleton_method(key) {self[key]}
        end
      end
    end

    # API for providing a default value for a property lookup.
    def with_default(default_value)
      WithDefault.new(self, default_value)
    end

    class WithDefault < SimpleDelegator
      def initialize(target, default_value)
        @default_value = default_value
        super(target)
      end

      def method_missing(*args)
        return @default_value unless __getobj__.respond_to? args.first
        value = super
        return @default_value if value.nil?
        value
      end
    end
  end
end
