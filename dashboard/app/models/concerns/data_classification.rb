# Declares the data classification of each of a model's attributes (columns). A
# classification describes how sensitive an attribute's data is, which lets features
# across the platform make consistent decisions about it. The first consumer is the
# MySQL -> Redshift analytics export (`AnalyticsExportable` /
# `Cdo::Aws::Redshift::MaterializedViewManager`), which uses classifications to decide
# whether a column belongs in the PII Materialized View, the non-PII View, or neither.
# Future consumers include `DeleteAccountsHelper` (which attributes to wipe/deidentify
# when purging a user) and a possible default SELECT scope. Because classification is
# foundational and not analytics-specific, it lives in its own concern.
#
# The four classifications, least to most sensitive:
#   :public            - safe to show anyone, including anonymous/guest users.
#   :confidential      - primarily the creating user's own content; the app warns users
#                        not to store personal information here.
#   :restricted        - personally identifiable / compliance-regulated data.
#   :highly_restricted - secrets (e.g. users.hashed_password, authentication_options.token).
#
# Declare only the exceptions. Any column you don't classify falls back to a fail-safe,
# type-based default (see `effective_data_classification`): text and most date/time
# columns are assumed :restricted; created_at/updated_at/deleted_at and scalar types
# (integer, boolean, float, ...) are :public.
#
# Usage (attribute-keyed hash; each column maps to exactly one classification):
#   class User < ApplicationRecord
#     data_classification(
#       name:               :restricted,
#       hashed_password:    :highly_restricted,
#       encrypted_password: :highly_restricted,
#     )
#   end
#
#   User.effective_data_classification(:name)          # => :restricted
#   User.column_names_classified_as(:public)           # => ["id", "created_at", ...]
module DataClassification
  extend ActiveSupport::Concern

  CLASSIFICATIONS = %i[public confidential restricted highly_restricted].freeze

  # Fail-safe defaults for undeclared columns, by data type. Free-text and JSON columns
  # and non-timestamp date/time columns are assumed to contain PII (:restricted);
  # timestamps and scalar numeric types are assumed safe (:public). JSON columns are
  # property bags that routinely hold free-form user content, so they are treated as
  # text. This is a general "when in doubt, treat as restricted" policy any consumer
  # can rely on.
  TEXT_DATA_TYPES = %i[string text json jsonb].freeze
  DATE_TIME_DATA_TYPES = %i[date datetime timestamp].freeze
  NON_PII_DATE_TIME_COLUMN_NAMES = %w[created_at updated_at deleted_at].freeze

  included do
    # A `class_attribute` inherits to STI subclasses; the `data_classification` macro
    # merges into it so a subclass extends, rather than replaces, its parent's
    # declarations.
    class_attribute :declared_data_classifications, default: {}
  end

  class_methods do
    # Declares the classification of one or more attributes.
    # @param mapping [Hash{Symbol,String => Symbol}] attribute name => classification.
    # @raise [ArgumentError] if any value is not one of CLASSIFICATIONS.
    def data_classification(mapping)
      mapping.each do |attr, level|
        unless CLASSIFICATIONS.include?(level)
          raise ArgumentError, "#{name}: unknown data classification #{level.inspect} " \
            "for #{attr.inspect}; expected one of #{CLASSIFICATIONS.inspect}"
        end
      end
      self.declared_data_classifications = declared_data_classifications.merge(mapping.symbolize_keys)
    end

    # The classification of a column: its declared classification if any, else the
    # type-based fail-safe default.
    # @param column [String, Symbol, #type] a column name or column object.
    # @return [Symbol] one of CLASSIFICATIONS.
    def effective_data_classification(column)
      col = column.respond_to?(:type) ? column : columns.find {|c| c.name.to_s == column.to_s}
      declared = declared_data_classifications[col.name.to_sym]
      return declared if declared

      if TEXT_DATA_TYPES.include?(col.type)
        :restricted
      elsif DATE_TIME_DATA_TYPES.include?(col.type)
        NON_PII_DATE_TIME_COLUMN_NAMES.include?(col.name) ? :public : :restricted
      else
        :public
      end
    end

    # The names of columns whose effective classification is in the given set. The
    # generic projection consumers build their policy on — e.g. the analytics non-PII
    # view asks for `column_names_classified_as(:public, :confidential)`.
    # @param levels [Array<Symbol>] one or more of CLASSIFICATIONS.
    # @return [Array<String>] column names.
    def column_names_classified_as(*levels)
      wanted = levels.flatten
      columns.select {|col| wanted.include?(effective_data_classification(col))}.map(&:name)
    end

    # Columns that have no explicit `data_classification` declaration (and so rely on the
    # type-based default). Drives a coverage report as we classify models. Lazy by
    # nature: reads the live column list, which requires the connection.
    # @return [Array<String>] column names.
    def undeclared_data_classification_columns
      columns.map(&:name) - declared_data_classifications.keys.map(&:to_s)
    end

    # Human-readable errors for declarations that reference a column that does not exist
    # on the table (typo guard). Lazy for the same reason as above: the table name may be
    # set, and the connection available, only after the class has finished loading.
    # @return [Array<String>] empty when all declared keys are real columns.
    def data_classification_errors
      bad = declared_data_classifications.keys.map(&:to_s) - columns.map(&:name)
      bad.empty? ? [] : ["declares data classification for unknown column(s): #{bad.join(', ')}"]
    end
  end
end
