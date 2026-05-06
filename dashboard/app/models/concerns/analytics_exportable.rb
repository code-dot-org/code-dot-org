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

  # Due to lazy validation, be sure to load all models (`Rails.application.eager_load!`) before calling this method.
  def self.exported_models
    @exported_models ||= Set.new
  end

  # Needed for unit tests.
  def self.reset_exported_models!
    @exported_models = Set.new
  end

  # Returns validation errors for all registered models.
  # @return [Array<String>] human-readable error messages, empty when valid.
  def self.exportability_errors
    exported_models.each_with_object([]) do |model, errors|
      if model.primary_key.blank?
        errors << "#{model.name} cannot be exported: Zero ETL requires a primary key"
      end

      blob_columns = model.columns.select {|col| BLOB_DATA_TYPES.include?(col.type)}.map(&:name)
      unless blob_columns.empty?
        errors << "#{model.name} cannot be exported: Zero ETL does not support blob columns (#{blob_columns.join(', ')})"
      end
    end
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
  # @param db_name [String] database name to use in filter expressions.
  #   Defaults to the connection's current database. Override to generate
  #   filters for a different environment (e.g., dashboard_production)
  #   while scanning tables from the local development database.
  # @param connection [ActiveRecord::ConnectionAdapters::AbstractAdapter]
  # @return [Array<String>] e.g., ["exclude: dashboard_production.schema_migrations"]
  def self.zero_etl_exclude_filters(db_name: nil, connection: ActiveRecord::Base.connection)
    db_name ||= connection.current_database
    connection.tables.filter_map do |table_name|
      columns = connection.columns(table_name)
      has_pk = columns.any? {|col| col.name == connection.primary_key(table_name)}
      has_blob = columns.any? {|col| BLOB_DATA_TYPES.include?(col.type)}
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

  # Splits a Maxwell data_filter string into individual rule strings.
  def self.parse_data_filter(data_filter)
    return [] if data_filter.blank?
    data_filter.split(/,\s*/)
  end

  # Returns true if a Maxwell filter rule references the given database.
  def self.rule_for_database?(rule, db_name)
    rule.match?(/\b#{Regexp.escape(db_name)}\./)
  end

  # Computes the diff between the current integration filter and the desired
  # state for the dashboard database. Rules for other databases are preserved
  # untouched.
  #
  # @param current_data_filter [String] the integration's current data_filter.
  # @param db_name [String] see zero_etl_exclude_filters.
  # @param connection [ActiveRecord::ConnectionAdapters::AbstractAdapter]
  # @return [Hash] :to_add, :to_remove, :unchanged, :reconciled_filter
  def self.reconcile_zero_etl_filters(current_data_filter, db_name: nil, connection: ActiveRecord::Base.connection)
    db_name ||= connection.current_database
    current_rules = parse_data_filter(current_data_filter)

    other_rules = current_rules.reject {|r| rule_for_database?(r, db_name)}
    current_dashboard_excludes = Set.new(
      current_rules.select {|r| r.start_with?('exclude:') && rule_for_database?(r, db_name)}
    )

    desired_dashboard_excludes = Set.new(zero_etl_exclude_filters(db_name: db_name, connection: connection))

    to_add = (desired_dashboard_excludes - current_dashboard_excludes).sort
    to_remove = (current_dashboard_excludes - desired_dashboard_excludes).sort
    unchanged = (current_dashboard_excludes & desired_dashboard_excludes).sort

    reconciled = other_rules + ["include: #{db_name}.*"] + desired_dashboard_excludes.sort

    {
      to_add: to_add,
      to_remove: to_remove,
      unchanged: unchanged,
      reconciled_filter: reconciled.join(", ")
    }
  end

  # Reads the current data_filter from a Zero ETL integration, reconciles
  # the dashboard database excludes, and optionally applies the update.
  #
  # @param integration_arn [String] ARN of the Zero ETL integration.
  # @param db_name [String] see zero_etl_exclude_filters.
  # @param connection [ActiveRecord::ConnectionAdapters::AbstractAdapter]
  # @param dry_run [Boolean] when true, computes the diff without applying.
  # @param rds_client [Aws::RDS::Client] injectable for testing.
  # @return [Hash] reconciliation result from reconcile_zero_etl_filters.
  def self.update_zero_etl_integration!(integration_arn:, db_name: nil, connection: ActiveRecord::Base.connection, dry_run: false, rds_client: nil)
    require 'aws-sdk-rds'
    rds_client ||= Aws::RDS::Client.new

    resp = rds_client.describe_integrations(integration_identifier: integration_arn)
    integration = resp.integrations.first
    raise ArgumentError, "Integration not found: #{integration_arn}" unless integration

    result = reconcile_zero_etl_filters(integration.data_filter, db_name: db_name, connection: connection)

    unless dry_run || (result[:to_add].empty? && result[:to_remove].empty?)
      rds_client.modify_integration(
        integration_identifier: integration_arn,
        data_filter: result[:reconciled_filter]
      )
    end

    result
  end
end
