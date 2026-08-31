# frozen_string_literal: true

# == Schema Information
#
# Table name: anonymous_level_progresses
#
#  id              :bigint           not null, primary key
#  anon_user_id    :string(36)       not null
#  script_id       :integer          not null
#  level_id        :integer          not null
#  unit_group_id   :integer
#  level_source_id :bigint           unsigned
#  attempts        :integer          default(0), not null
#  best_result     :integer
#  submitted       :boolean
#  time_spent      :integer
#  properties      :text(65535)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_anonymous_level_progresses_on_unique_anon_script_level  (anon_user_id,script_id,level_id) UNIQUE
#
class AnonymousLevelProgress < ApplicationRecord
  include LevelProgressable

  export_to_analytics

  data_classification(
    id: :confidential,
    anon_user_id: :confidential,
    script_id: :confidential,
    level_id: :confidential,
    unit_group_id: :confidential,
    level_source_id: :confidential,
    attempts: :confidential,
    best_result: :confidential,
    submitted: :confidential,
    time_spent: :confidential,
    properties: :confidential,
    created_at: :confidential,
    updated_at: :confidential,
  )

  validates :anon_user_id, presence: true, uniqueness: {scope: %i[script_id level_id]}
  validates :script_id, presence: true
  validates :level_id, presence: true
end
