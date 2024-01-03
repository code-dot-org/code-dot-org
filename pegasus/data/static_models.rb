require lib_dir 'cdo/data/csv_to_sql_table'
require 'active_support/core_ext/module/attribute_accessors'

# Inject static Sequel models for all CSV-derived Pegasus database tables.
# Uses the :static_cache Sequel plugin to provide the static model functionality.
# Models are prepended to the DB `:[]` accessors (e.g., `DB[:cdo_languages]`).
# Models are lazy-loaded on first access.
# Once initialized, models can also be accessed more directly through a camelized
# constant (e.g., `CdoLanguages.all`).
#
# Note that the static_cache plugin only uses the cache for specific methods:
#
# * Primary key lookups (e.g. Model[1])
# * Model.all
# * Model.each
# * Model.count (without an argument or block)
# * Model.map
# * Model.as_hash
# * Model.to_hash
# * Model.to_hash_groups
#
# This module extends the plugin to implement some Sequel query-methods
# through operations on static models, for the following methods:
#
#  * query.where
#  * query.and
#  * query.limit
#  * query.order
#
# For example, the following query will be satisfied by the static model:
#
# Model.where(key: 'val').order(:key).limit(5)
#
module StaticModels
  mattr_accessor(:expires_in) {rack_env?(:development, :staging) ? 10.seconds : nil}

  def [](table)
    @csv_tables ||= Dir.glob(pegasus_dir('data/*.csv')).map do |path|
      CsvToSqlTable.new(path, db: self)
    end.map(&:table)
    return super unless @csv_tables.include?(table)

    @db_models ||= {}
    return @db_models[table] if @db_models[table]
    model = Class.new(Sequel::Model(super)) do
      plugin :static_cache

      def self.where(hash, *)
        return super if hash.is_a?(String)
        all.where(hash)
      end

      def self.and(hash)
        all.and(hash)
      end

      def self.limit(num)
        all.limit(num)
      end

      def self.order(key)
        all.order(key)
      end

      def self.all
        refresh!
        Queryable.new super
      end

      def self.refresh!
        CDO.cache.fetch("static_cache/#{self}", expires_in: StaticModels.expires_in) do
          load_cache
          true
        end
      end
    end
    Object.const_set(table.to_s.camelize, model)
    @db_models[table] = model
  end

  # Implement some basic Sequel-like query behavior on an Array subclass,
  # to allow method-chaining on results.
  class Queryable < Array
    def all
      self
    end

    def to_a
      map(&:to_hash)
    end

    def where(hash)
      result = select do |row|
        hash.to_a.all? do |k, v|
          if v.is_a?(Array)
            v.include?(row[k])
          elsif [TrueClass, FalseClass].include?(row[k].class)
            row[k] == v.to_s.match?(/^(true|t|yes|y|1)$/i)
          else
            row[k] == v
          end
        end
      end
      self.class.new result
    end

    def and(hash)
      where(hash)
    end

    def not(hash)
      result = select do |row|
        hash.to_a.all? do |k, v|
          row[k] != v
        end
      end
      self.class.new result
    end

    def limit(num)
      self.class.new first(num)
    end

    def order(key)
      self.class.new(sort {|a, b| a[key].to_s <=> b[key].to_s})
    end
  end
end
