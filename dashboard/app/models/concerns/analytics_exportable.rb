# Declares that a model's database table should be exported to the analytics
# data warehouse via AWS Zero ETL. Including this concern and calling
# `export_to_analytics` in a model class registers it for materialized view
# generation in Redshift.
#
# Zero ETL cannot export tables that lack a primary key or contain blob
# (binary) columns. These conditions are validated lazily when
# `validate_exported_models!` is called, not at class load time, because
# models may set `self.table_name` or `self.primary_key` after the
# `export_to_analytics` declaration.
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

  def self.exported_models
    @exported_models ||= Set.new
  end

  def self.reset_exported_models!
    @exported_models = Set.new
  end

  # Validates that all registered models can be exported via Zero ETL.
  # Call after eager loading when all models have finished defining
  # table_name and primary_key.
  # @raise [ArgumentError] if any model lacks a primary key or has blob columns.
  def self.validate_exported_models!
    exported_models.each do |model|
      if model.primary_key.blank?
        raise ArgumentError, "#{model.name} cannot be exported: Zero ETL requires a primary key"
      end

      blob_columns = model.columns.select {|col| BLOB_DATA_TYPES.include?(col.type)}.map(&:name)
      unless blob_columns.empty?
        raise ArgumentError, "#{model.name} cannot be exported: Zero ETL does not support blob columns (#{blob_columns.join(', ')})"
      end
    end
  end

  # Generates Maxwell filter exclude expressions for tables that cannot be
  # replicated via Zero ETL (no primary key or blob columns). These are
  # intended to be paired with a blanket include rule like:
  #   include: `dashboard_production`.*
  #
  # @param environment_type [String, Symbol] e.g., :production, :test
  # @param models [Array<Class>] ActiveRecord model classes to evaluate.
  # @return [Array<String>] Maxwell-syntax exclude expressions,
  #   e.g., ["exclude: `dashboard_production`.`schema_migrations`"]
  def self.zero_etl_exclude_filters(environment_type:, models:)
    db_name = "dashboard_#{environment_type}"
    models.filter_map do |model|
      next if model.primary_key.present? && model.columns.none? {|col| BLOB_DATA_TYPES.include?(col.type)}
      "exclude: `#{db_name}`.`#{model.table_name}`"
    end
  end
end
