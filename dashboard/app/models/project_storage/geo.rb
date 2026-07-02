# frozen_string_literal: true

# == Schema Information
#
# Table name: project_storage_geos
#
#  id          :bigint           not null, primary key
#  storage_id  :integer          not null
#  country     :string(255)
#  state       :string(255)
#  city        :string(255)
#  postal_code :string(255)
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
    country: :confidential,
    state: :confidential,
    city: :confidential,
    postal_code: :confidential,
    created_at: :confidential,
    updated_at: :confidential,
  )

  belongs_to :project_storage, class_name: 'ProjectStorage', foreign_key: :storage_id, inverse_of: :geo

  validates :storage_id, uniqueness: true
end
