# A flattened view of the status-change history of Pd teacher applications, one
# row per status transition. Populated (TRUNCATE + bulk INSERT) by
# `bin/cron/create_rollup_tables`, which unpacks each application's status log in
# Ruby.
#
# This model exists only to register the table for analytics export: it declares
# `export_to_analytics` so the rollup ships to Redshift via Zero ETL (replacing
# the legacy DMS export of this table). The cron writes via raw SQL and does not
# use this class.
#
# This data derives from Pd::Application, which classifies its `status` and
# status-change history as :restricted; the rollup is classified :restricted to
# match, so it exports only to the PII tier of Materialized Views.
# == Schema Information
#
# Table name: pd_applications_status_logs
#
#  id                :bigint           not null, primary key
#  pd_application_id :bigint           not null
#  status            :string(255)      not null
#  timestamp         :datetime         not null
#  position          :integer          not null
#
class Pd::ApplicationsStatusLog < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    pd_application_id: :restricted,
    status: :restricted,
    timestamp: :restricted,
    position: :restricted,
  )
end
