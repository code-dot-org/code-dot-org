# frozen_string_literal: true

# This is a backport-patch of https://github.com/rails/rails/pull/35891,
# "Deduplicate various Active Record schema cache structures".
#
# Though the PR's original use-case was to improve performance with large sharded schemas,
# our use-case is to produce a schema cache dump that maintains identical binary data when re-serialized.
#
# The inconsistent deduplication of table-column Strings used as hash keys made the binary output inconsistent,
# and this patch seems to help fix the issue.
module SchemaCacheDedup
  def primary_keys(table_name)
    @primary_keys.fetch(table_name) do
      if data_source_exists?(table_name)
        @primary_keys[deep_deduplicate(table_name)] = deep_deduplicate(connection.primary_key(table_name))
      end
    end
  end

  def data_source_exists?(name)
    prepare_data_sources if @data_sources.empty?
    return @data_sources[name] if @data_sources.key? name

    @data_sources[deep_deduplicate(name)] = connection.data_source_exists?(name)
  end

  def columns(table_name)
    @columns.fetch(table_name) do
      @columns[deep_deduplicate(table_name)] = deep_deduplicate(connection.columns(table_name))
    end
  end

  def columns_hash(table_name)
    @columns_hash.fetch(table_name) do
      @columns_hash[deep_deduplicate(table_name)] = columns(table_name).index_by(&:name).freeze
    end
  end

  def marshal_dump
    derive_columns_hash_and_deduplicate_values
    @version = ActiveRecord::Migrator.current_version
    [@version, @columns, {}, @primary_keys, @data_sources]
  end

  def marshal_load(array)
    @version, @columns, _columns_hash, @primary_keys, @data_sources = array

    derive_columns_hash_and_deduplicate_values
  end

  private

  def derive_columns_hash_and_deduplicate_values
    @columns      = deep_deduplicate(@columns)
    @columns_hash = @columns.transform_values {|columns| columns.index_by(&:name)}
    @primary_keys = deep_deduplicate(@primary_keys)
    @data_sources = deep_deduplicate(@data_sources)
  end

  def deep_deduplicate(value)
    case value
    when Hash
      value.transform_keys(&method(:deep_deduplicate)).transform_values(&method(:deep_deduplicate))
    when Array
      value.map(&method(:deep_deduplicate))
    when String, Deduplicable
      # Marshal#load taints objects, and tainted objects can't be deduplicated.
      # Taint mechanism is deprecated in Ruby 2.7.
      value = value.dup.untaint if value.tainted?
      -value
    else
      value
    end
  end

  module Deduplicable
    module ClassMethods
      def registry
        @registry ||= {}
      end

      def new(*)
        super.deduplicate
      end
    end

    def deduplicate
      self.class.registry[self] ||= deduplicated
    end
    alias :-@ :deduplicate

    private

    def deduplicated
      freeze
    end
  end

  module ColumnDedup
    include Deduplicable

    private

    def deduplicated
      @name = -name
      @table_name = -table_name if table_name
      @sql_type_metadata = sql_type_metadata.deduplicate if sql_type_metadata
      @default = -default if default
      @default_function = -default_function if default_function
      @collation = -collation if collation
      @comment = -comment if comment
      super
    end
  end
  ActiveRecord::ConnectionAdapters::Column.prepend ColumnDedup
  ActiveRecord::ConnectionAdapters::Column.singleton_class.prepend Deduplicable::ClassMethods

  module SqlTypeMetadataDedup
    include Deduplicable

    private

    def deduplicated
      # MySQL supports an extension for optionally specifying the display width of integer data types in parentheses.
      # Filter display width attributes from schema-cache, they are deprecated/removed in MySQL 8.0.17.
      @sql_type.gsub!(/\(\d+\)/, '') if @type == :integer
      @sql_type = -sql_type
      super
    end
  end
  ActiveRecord::ConnectionAdapters::SqlTypeMetadata.prepend SqlTypeMetadataDedup
  ActiveRecord::ConnectionAdapters::SqlTypeMetadata.singleton_class.prepend Deduplicable::ClassMethods

  module MySQLTypeDedup
    include Deduplicable

    def initialize(type_metadata, extra: nil)
      super
    end

    private

    def deduplicated
      __setobj__(__getobj__.deduplicate)
      @extra = -extra if extra
      super
    end
  end
  ActiveRecord::ConnectionAdapters::MySQL::TypeMetadata.prepend MySQLTypeDedup
  ActiveRecord::ConnectionAdapters::MySQL::TypeMetadata.singleton_class.prepend Deduplicable::ClassMethods
end
ActiveRecord::ConnectionAdapters::SchemaCache.prepend SchemaCacheDedup
