# Declares that a model's database table should be exported to the analytics data warehouse via AWS Zero ETL. In
# practice, it is simpler to configure Zero ETL to export all tables with an Include filter statement
# (`include: dashboard_test.*`) and then selectively exclude tables that should not be exported due to compatibility
# issues with Zero ETL (don't have a primary key, or contain one or more blob columns). Declaring a model to be
# exportable to analytics ensures that `Cdo::Aws::Redshift::MaterializedViews` creates a PII and non-PII Materialized
# View in Redshift to make the target (exported) Zero ETL available for Data Analysts and their reporting systems to
# query.
#
# Including this concern and calling
# `export_to_analytics` in a model class registers it for materialized view
# generation in Redshift.
#
# Zero ETL cannot export tables that lack a `PRIMARY KEY` constraint or that
# contain blob (binary) columns. Both conditions are checked against the live
# database schema (via the model's connection), not the model class, since a
# Rails-level `self.primary_key = 'id'` declaration does not imply a real
# database-level primary key (see the `schools` table for an example).
#
# Validation is lazy — performed by `validate_exported_models!` /
# `exportability_errors`, not at class load time — because:
#   * Models may set `self.table_name` after the `export_to_analytics`
#     declaration, and we need the final table name to query the schema.
#   * The database connection is not necessarily available when the model
#     class is first loaded.
#   * All models must be loaded (`Rails.application.eager_load!`) before the
#     registry is complete.
#
# Usage:
#   class User < ApplicationRecord
#     export_to_analytics
#   end
#
#   AnalyticsExportable.exported_models  # => #<Set: {User}>
module AnalyticsExportable
  extend ActiveSupport::Concern

  BLOB_DATA_TYPES = [:binary].freeze

  class_methods do
    def export_to_analytics
      if self != base_class
        raise ArgumentError, "export_to_analytics must be called on the Single Table Inheritance base class (#{base_class.name}), not #{name}"
      end

      AnalyticsExportable.exported_models.add(self)
    end
  end

  # Due to lazy validation, be sure to load all models (`Rails.application.eager_load!`) before calling this method.
  def self.exported_models
    @exported_models ||= Set.new
  end

  # Needed for unit tests.
  def self.reset_exported_models!
    @exported_models = Set.new
  end

  # Returns per-model exportability errors for every registered model that
  # fails validation. The primary-key check consults the database (via
  # `connection.primary_key`) rather than the Rails model's `primary_key`
  # attribute: a model can declare `self.primary_key = 'id'` even when the
  # underlying table only has a UNIQUE index and no `PRIMARY KEY` constraint
  # (e.g., the `schools` table), and Zero ETL requires a real database-level
  # primary key.
  #
  # @return [Hash{Class => Array<String>}] invalid models mapped to their
  #   reason strings (without the model-name prefix). Empty when all models
  #   are valid.
  def self.exportability_errors_by_model
    exported_models.each_with_object({}) do |model, errors_by_model|
      reasons = []
      if model.connection.primary_key(model.table_name).blank?
        reasons << "Zero ETL requires a primary key"
      end

      blob_columns = model.columns.select {|col| BLOB_DATA_TYPES.include?(col.type)}.map(&:name)
      unless blob_columns.empty?
        reasons << "Zero ETL does not support blob columns (#{blob_columns.join(', ')})"
      end

      # Surface DataClassification typos (a declared column that doesn't exist) as an
      # export validation error, since they silently misclassify the generated views.
      reasons.concat(model.data_classification_errors)

      errors_by_model[model] = reasons if reasons.any?
    end
  end

  # Maps each exported model to the columns that have no explicit
  # `data_classification` declaration (and so rely on the type-based default). Use to
  # track progress as we classify exported models.
  # @return [Hash{Class => Array<String>}] models with undeclared columns mapped to
  #   those column names. Models with full coverage are omitted.
  def self.classification_coverage
    exported_models.each_with_object({}) do |model, coverage|
      undeclared = model.undeclared_data_classification_columns
      coverage[model] = undeclared unless undeclared.empty?
    end
  end

  # Returns validation errors for all registered models as a flat list of
  # human-readable strings prefixed with the model name.
  # @return [Array<String>] human-readable error messages, empty when valid.
  def self.exportability_errors
    exportability_errors_by_model.flat_map do |model, reasons|
      reasons.map {|reason| "#{model.name} cannot be exported: #{reason}"}
    end
  end

  # Returns the subset of registered models that pass exportability checks.
  # Use this in long-running jobs (e.g., `analytics_export:provision_materialized_views`)
  # that should warn-and-skip invalid models rather than abort the run.
  # @return [Set<Class>]
  def self.valid_exported_models
    invalid_models = exportability_errors_by_model
    invalid_models.each do |model, reasons|
      reasons.each {|reason| CDO.log.error "[analytics-export] #{model.name} cannot be exported: #{reason}"}
    end
    exported_models - invalid_models.keys
  end

  # Bare table names of every Model that passes exportability checks, without the `database.`
  # qualifier. Helps support Rails Models that persist to the Pegasus database.
  # @return [Array<String>]
  def self.exported_table_names
    valid_exported_models.map {|model| model.table_name.to_s.rpartition('.').last}
  end

  # @raise [ArgumentError] if any model lacks a primary key or has blob columns.
  def self.validate_exported_models!
    errors = exportability_errors
    raise ArgumentError, errors.join("; ") unless errors.empty?
  end

  # Returns Maxwell filter exclude expressions for tables that cannot be
  # replicated via Zero ETL (no primary key or blob columns). Iterates over
  # every table in the local database connection.
  #
  # `connection.primary_key(table_name)` returns a String for a single-column
  # primary key, an Array of column names for a composite primary key (e.g.,
  # `school_stats_by_years` has `PRIMARY KEY (school_id, school_year)`), and
  # nil when the table has no PRIMARY KEY constraint. Zero ETL supports both
  # single and composite primary keys, so any non-blank return value counts
  # as has_pk.
  #
  # @param db_name [String] database name to use in filter expressions.
  #   Defaults to the connection's current database. Override to generate
  #   filters for a different environment (e.g., dashboard_production)
  #   while scanning tables from the local development database.
  # @param connection [ActiveRecord::ConnectionAdapters::AbstractAdapter]
  # @return [Array<String>] e.g., ["exclude: dashboard_production.schema_migrations"]
  def self.zero_etl_exclude_filters(db_name: nil, connection: ActiveRecord::Base.connection)
    db_name ||= connection.current_database
    connection.tables.filter_map do |table_name|
      has_pk = connection.primary_key(table_name).present?
      has_blob = connection.columns(table_name).any? {|col| BLOB_DATA_TYPES.include?(col.type)}
      "exclude: #{db_name}.#{table_name}" unless has_pk && !has_blob
    end
  end

  # Builds the complete data_filter string for the dashboard database in a
  # Zero ETL integration: a blanket include followed by per-table excludes.
  #
  # @param db_name [String] see zero_etl_exclude_filters.
  # @param connection [ActiveRecord::ConnectionAdapters::AbstractAdapter]
  # @return [String] Maxwell filter expression
  def self.zero_etl_data_filter(db_name: nil, connection: ActiveRecord::Base.connection)
    db_name ||= connection.current_database
    rules = ["include: #{db_name}.*"]
    rules.concat(zero_etl_exclude_filters(db_name: db_name, connection: connection))
    rules.join(", ")
  end
end
