# A flattened view of the answer options for contained levels of the answerable
# types (Multi, Match, EvaluationMulti). Populated (TRUNCATE + bulk INSERT) by
# `bin/cron/create_rollup_tables`, which extracts the `answers` array from each
# level's `properties` blob in Ruby.
#
# This model exists only to register the table for analytics export: it declares
# `export_to_analytics` so the rollup ships to Redshift via Zero ETL (replacing
# the legacy DMS export of this table). The cron writes via raw SQL and does not
# use this class. All columns are public curriculum metadata.
# == Schema Information
#
# Table name: contained_level_answers
#
#  id            :integer          not null, primary key
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  level_id      :integer          not null
#  answer_number :integer          not null
#  answer_text   :text(65535)
#  correct       :boolean
#
# Indexes
#
#  index_contained_level_answers_on_level_id  (level_id)
#
class ContainedLevelAnswer < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    created_at: :public,
    updated_at: :public,
    level_id: :public,
    answer_number: :public,
    answer_text: :public,
    correct: :public,
  )
end
