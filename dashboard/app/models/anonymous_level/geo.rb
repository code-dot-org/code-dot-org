# frozen_string_literal: true

require 'cdo/anon_user_id'

# == Schema Information
#
# Table name: anonymous_level_geos
#
#  id           :bigint           not null, primary key
#  anon_user_id :string(36)       not null
#  country      :string(255)
#  state        :string(255)
#  city         :string(255)
#  postal_code  :string(255)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_anonymous_level_geos_on_anon_user_id  (anon_user_id) UNIQUE
#
class AnonymousLevel::Geo < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :confidential,
    anon_user_id: :confidential,
    country: :restricted,
    state: :restricted,
    city: :restricted,
    postal_code: :restricted,
    created_at: :confidential,
    updated_at: :confidential,
  )

  validates :anon_user_id, presence: true, format: {with: Cdo::AnonUserId::FORMAT}, uniqueness: true
end
