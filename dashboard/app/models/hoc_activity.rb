# This Model currently exists ONLY to register the table for analytics export -- it declares
# `export_to_analytics` so the table ships to Redshift via Zero ETL. Nothing currently reads or writes
# through this class: the table belongs to the legacy Sinatra Pegasus application and is still accessed with
#  Sequel via `PEGASUS_DB`, in `HocLegacy::SessionManageable` (insert) and `HocLegacy::CertificatesController`
# (name update).
#
# `table_name` is qualified with the Pegasus database so ActiveRecord resolves it across databases on
# the same cluster; `CDO.pegasus_db_name` because that name is environment-specific (`pegasus` in
# production, `pegasus_test`, `pegasus_development`).
# == Schema Information
#
# Table name: pegasus_development.hoc_activity
#
#  id                :bigint           not null, primary key
#  session           :string(50)       not null
#  referer           :string(50)
#  company           :string(50)
#  tutorial          :string(50)
#  started_at        :datetime
#  started_ip        :string(50)
#  pixel_started_at  :datetime
#  pixel_started_ip  :string(50)
#  pixel_finished_at :datetime
#  pixel_finished_ip :string(50)
#  finished_at       :datetime
#  finished_ip       :string(50)
#  country_code      :string(2)
#  state_code        :string(2)
#  city              :string(50)
#  location          :string(50)
#  name              :string(255)
#  country           :string(50)
#  state             :string(50)
#
# Indexes
#
#  hoc_activity_city_index               (city)
#  hoc_activity_company_index            (company)
#  hoc_activity_country_code_index       (country_code)
#  hoc_activity_country_index            (country)
#  hoc_activity_finished_at_index        (finished_at)
#  hoc_activity_pixel_finished_at_index  (pixel_finished_at)
#  hoc_activity_pixel_started_at_index   (pixel_started_at)
#  hoc_activity_session_index            (session)
#  hoc_activity_started_at_index         (started_at)
#  hoc_activity_state_code_index         (state_code)
#  hoc_activity_state_index              (state)
#  hoc_activity_tutorial_index           (tutorial)
#  session                               (session) UNIQUE
#
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
