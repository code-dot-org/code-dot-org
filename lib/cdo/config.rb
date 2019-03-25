require 'singleton'
require 'cdo/yaml'

module Cdo
  # Loads and combines structured application configuration settings.
  class Config < OpenStruct
    # Soft-freeze: Don't allow any config items to be created/modified,
    # but allow stubbing for unit tests.
    def freeze
      @table.each_key(&method(:new_ostruct_member!))
      @frozen = true
    end

    def method_missing(key, *args)
      msg = "Undefined #{self.class} reference: #{key}"
      raise ArgumentError, msg, caller(1) if @frozen
      # puts msg, caller(1) if @frozen
      super
    end

    def modifiable?
      msg = "can't modify frozen #{self.class}"
      raise RuntimeError, msg, caller(2) if @frozen
      # puts msg, caller(2) if @frozen
      super
    end

    # Loads one or several sources into the merged configuration.
    # Resolves dynamic config self-references by re-rendering + merging until result is unchanged.
    def load_configuration(*sources)
      config = nil
      i = 5
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
        end
      end
    end

    # Merge the provided config hash into the current config.
    # 'Reverse-merge' keeps existing values except for `nil`.
    def merge(config)
      return if config.nil?
      table.merge!(config.transform_keys(&:to_sym)) do |_key, old, new|
        old.nil? ? new : old
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
