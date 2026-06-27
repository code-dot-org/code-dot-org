# frozen_string_literal: true

# == Schema Information
#
# Table name: project_storage_geos
#
#  id          :bigint           not null, primary key
#  storage_id  :integer          not null
#  ip_address  :string(255)      not null
#  country     :string(255)
#  state       :string(255)
#  city        :string(255)
#  postal_code :string(255)
#  latitude    :decimal(8, 6)
#  longitude   :decimal(9, 6)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_project_storage_geos_on_storage_id  (storage_id) UNIQUE
#
class ProjectStorage::Geo < ApplicationRecord
  self.table_name = :project_storage_geos

  export_to_analytics

  data_classification(
    id: :confidential,
    storage_id: :confidential,
    ip_address: :restricted,
    country: :confidential,
    state: :confidential,
    city: :confidential,
    postal_code: :confidential,
    latitude: :restricted,
    longitude: :restricted,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :project_storage, class_name: 'ProjectStorage', foreign_key: :storage_id, inverse_of: :geo

  validates :storage_id, uniqueness: true
  validates :ip_address, presence: true
end
