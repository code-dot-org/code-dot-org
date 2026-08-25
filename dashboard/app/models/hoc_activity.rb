# This Model currently exists ONLY to register the table for analytics export -- it declares
# `export_to_analytics` so the table ships to Redshift via Zero ETL. Nothing currently reads or writes
# through this class: the table belongs to the legacy Sinatra Pegasus application and is still accessed with
#  Sequel via `PEGASUS_DB`, in `HocLegacy::SessionManageable` (insert) and `HocLegacy::CertificatesController`
# (name update).
#
# `table_name` is qualified with the Pegasus database so ActiveRecord resolves it across databases on
# the same cluster; `CDO.pegasus_db_name` because that name is environment-specific (`pegasus` in
# production, `pegasus_test`, `pegasus_development`).
class HocActivity < ApplicationRecord
  self.table_name = "#{CDO.pegasus_db_name}.hoc_activity"

  export_to_analytics

  data_classification(
    id: :confidential,
    session: :highly_restricted,
    referer: :confidential,
    company: :public,
    tutorial: :public,
    started_at: :confidential,
    started_ip: :highly_restricted,
    pixel_started_at: :confidential,
    pixel_started_ip: :highly_restricted,
    pixel_finished_at: :confidential,
    pixel_finished_ip: :highly_restricted,
    finished_at: :confidential,
    finished_ip: :highly_restricted,
    country_code: :confidential,
    state_code: :confidential,
    city: :restricted,
    location: :restricted,
    name: :highly_restricted,
    country: :confidential,
    state: :confidential,
  )
end
