# Strips NUL (U+0000) bytes from an ActiveRecord model's textual attributes before every save.
#
# Why: MySQL's `text`/`json` types accept NUL, but many downstream consumers reject it - most
# painfully Redshift's SUPER type during the Zero ETL analytics export, which fails such a row with
# load error 1224 ("Input data not well formed JSON format for super data type") and stalls the
# whole table's replication. NUL has no legitimate use in text or JSON (only in binary data, which
# this concern never touches), so removing it is safe and keeps the export healthy.
#
# Scope is deliberately narrow:
#   * Only NUL is stripped. Tab / newline / carriage-return and other control characters ARE valid
#     in text (multi-line chat, code, markdown) and are preserved.
#   * Only `text` and `json` columns are cleaned (never `:binary`, so blob / serialized / ciphertext
#     data is safe). See SANITIZABLE_COLUMN_TYPES for why short `string`/VARCHAR columns are skipped.
#   * A model may exempt specific columns with `skip_null_byte_sanitization :col, ...` - e.g. a text
#     column holding data that must round-trip byte-for-byte.
#
# Wiring: `AnalyticsExportable#export_to_analytics` includes this automatically, so every table we
# export to Redshift is guarded. A model that wants the protection without being exported can
# `include SanitizesNullBytes` directly.
module SanitizesNullBytes
  extend ActiveSupport::Concern

  NULL_BYTE = "\u0000".freeze
  # Column types we scan. `json` maps to Redshift's SUPER type, which rejects NUL outright (Zero ETL
  # load error 1224) with no ingestion-side remedy - so cleaning it at write is mandatory. `text`
  # holds the large free-form content where NUL actually shows up (paste, model output); we clean it
  # as cheap defense-in-depth. We intentionally skip short `string`/VARCHAR columns: both `text` and
  # `string` land in a Redshift VARCHAR, which the integration's ACCEPTINVCHARS setting already
  # sanitizes at ingestion, and `string` is the most numerous column type (widest scan + mutation
  # footprint) while rarely holding NUL-bearing free text. Widen this set only deliberately.
  SANITIZABLE_COLUMN_TYPES = %i[text json jsonb].freeze

  included do
    class_attribute :null_byte_exempt_columns, instance_writer: false, default: [].freeze
    # around_save so a single method can both strip before the write and, after it, log the offending
    # row by primary key - which is only assigned once a newly-created record has been INSERTed.
    around_save :strip_and_log_null_bytes
  end

  class_methods do
    # Exempt one or more columns from NUL sanitization (accepts symbols or strings).
    def skip_null_byte_sanitization(*columns)
      self.null_byte_exempt_columns = (null_byte_exempt_columns + columns.map(&:to_s)).uniq.freeze
      # Bust the memoized column list so a later declaration is reflected.
      @null_byte_sanitizable_columns = nil
    end

    # The columns this model sanitizes: non-binary textual columns, minus any exemptions. Memoized
    # per class (like ActiveRecord's own column caching).
    def null_byte_sanitizable_columns
      @null_byte_sanitizable_columns ||= columns.
        select {|column| SANITIZABLE_COLUMN_TYPES.include?(column.type)}.
        map(&:name).
        reject {|name| null_byte_exempt_columns.include?(name)}.
        freeze
    end
  end

  # Recursively removes NUL from a value: strings are cleaned, arrays/hashes are walked, anything
  # else (numbers, booleans, nil) is returned untouched. A string with no NUL is returned as-is so
  # callers can cheaply detect "nothing changed".
  def self.deep_strip_null_bytes(value)
    case value
    when String
      value.include?(NULL_BYTE) ? value.delete(NULL_BYTE) : value
    when Array
      value.map {|element| deep_strip_null_bytes(element)}
    when Hash
      value.transform_values {|element| deep_strip_null_bytes(element)}
    else
      value
    end
  end

  private def strip_and_log_null_bytes
    stripped_columns = strip_null_bytes
    yield
    log_null_bytes_stripped(stripped_columns) # After the write, so a new record's id is populated.
  end

  # Strips NUL from each changed, sanitizable column and returns the names of the columns it actually
  # modified (empty when there was nothing to clean).
  private def strip_null_bytes
    self.class.null_byte_sanitizable_columns.filter_map do |column|
      next unless will_save_change_to_attribute?(column)

      original = self[column]
      cleaned = SanitizesNullBytes.deep_strip_null_bytes(original)
      # deep_strip returns a value-equal copy when there was no NUL; only write (and report) on a
      # real change so we neither dirty the attribute needlessly nor over-report.
      next if cleaned == original

      self[column] = cleaned
      column
    end
  end

  # Observability: a stripped NUL means some upstream source produced garbage input, so surface the
  # offending record (a CloudWatch Logs metric filter can alarm on this) without failing the save.
  # Logs ONLY the model, primary key, and column names - never the stripped value, which may be long
  # and may contain PII. Its own rescue keeps a logging hiccup from escaping the save.
  private def log_null_bytes_stripped(columns)
    return if columns.empty?

    CDO.log.warn(
      "[SanitizesNullBytes] stripped NUL bytes from #{self.class.name}##{id} " \
        "column(s): #{columns.join(', ')}"
    )
  rescue StandardError
    nil
  end
end
