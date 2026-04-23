# Declares that a model's database table should be exported to the analytics
# data warehouse via AWS Zero ETL. Including this concern and calling
# `export_to_analytics` in a model class registers it for materialized view
# generation in Redshift.
#
# Zero ETL cannot export tables that lack a primary key or contain blob
# (binary) columns. These conditions are validated at registration time.
#
# Usage:
#   class User < ApplicationRecord
#     include AnalyticsExportable
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

      if primary_key.blank?
        raise ArgumentError, "#{name} cannot be exported: Zero ETL requires a primary key"
      end

      if columns.any? {|col| BLOB_DATA_TYPES.include?(col.type)}
        blob_columns = columns.select {|col| BLOB_DATA_TYPES.include?(col.type)}.map(&:name)
        raise ArgumentError, "#{name} cannot be exported: Zero ETL does not support blob columns (#{blob_columns.join(', ')})"
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
