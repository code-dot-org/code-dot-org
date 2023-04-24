require 'singleton'
require 'delegate'
require 'cdo/yaml'

module Cdo
  # Loads and combines structured application configuration settings.
  class Config
    attr_reader :table
    protected :table

    def initialize
      @table = {}
    end

    def to_h
      @table.dup
    end

    def hash
      @table.hash
    end

    def [](name)
      @table[name.to_sym]
    end

    #def []=(name, value)
    #  puts "[]=(#{name.inspect}, #{value.inspect})"
    #  @table[name.to_sym] = value
    #end

    def key?(name)
      @table.key?(name.to_sym)
    end

    #def respond_to_missing?(mid, include_private = false) # :nodoc:
    #  puts "respond_to_missing?(#{mid.inspect}, #{include_private.inspect})"
    #  mname = mid.to_s.chomp("=").to_sym
    #  defined?(@table) && @table.key?(mname) || super
    #end

    private def method_missing(mid, *args) # :nodoc:
      len = args.length
      if mname = mid[/.*(?==\z)/m]
        if len != 1
          raise! ArgumentError, "wrong number of arguments (given #{len}, expected 1)", caller(1)
        end
        load_configuration({mname => args[0]})
      elsif len == 0
        # intentional no-op
      else
        begin
          super
        rescue NoMethodError => exception
          exception.backtrace.shift
          raise!
        end
      end
    end

    # Soft-freeze: Don't allow any config items to be created/modified,
    # but allow stubbing for unit tests.
    def freeze
      @frozen = true
      @table.freeze
      super
    end

    # Loads one or several sources into the merged configuration.
    # Resolves dynamic config self-references by re-rendering + merging until result is unchanged.
    def load_configuration(*sources)
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
    # 'Reverse-merge' keeps existing values.
    def merge(config)
      return if config.nil?

      # Add an accessor method for each new key/value pair
      #new_keys = config.keys.filter {|key| !self.key?(key)}
      #new_keys.each do |key|
      #  unless singleton_class.method_defined?(key)
      #    define_singleton_method(key) { self[key] }
      #  end
      #end
      new_keys = config.keys.filter {|key| !singleton_class.method_defined?(key)}
      new_keys.each {|key| define_singleton_method(key) {self[key]}}

      # 'Reverse-merge' keeps existing values.
      table.merge!(config) {|_key, old, _new| old}
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
