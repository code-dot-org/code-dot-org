class CensusSummariesAuditDataNullable < ActiveRecord::Migration[6.1]
  def change
    change_column_null :census_summaries, :audit_data, true
  end
end
