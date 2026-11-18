# frozen_string_literal: true

require 'cdo/anon_user_id'

# == Schema Information
#
# Table name: anonymous_level_clients
#
#  id             :bigint           not null, primary key
#  anon_user_id   :string(36)       not null
#  name           :string(255)
#  install_source :string(255)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_anonymous_level_clients_on_anon_user_id  (anon_user_id) UNIQUE
#
class AnonymousLevel::Client < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :confidential,
    anon_user_id: :confidential,
    name: :restricted,
    install_source: :restricted,
    created_at: :confidential,
    updated_at: :confidential,
  )

  validates :anon_user_id, presence: true, format: {with: Cdo::AnonUserId::FORMAT}, uniqueness: true
end
