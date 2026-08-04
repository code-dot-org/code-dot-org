# A flattened, denormalized view of the levels contained within LevelGroup,
# BubbleChoice, and other parent levels. Populated (TRUNCATE + bulk INSERT) by
# `bin/cron/create_rollup_tables`, which does the flattening in Ruby against the
# full `levels.properties` blob.
#
# This model exists only to register the table for analytics export: it declares
# `export_to_analytics` so the rollup ships to Redshift via Zero ETL (replacing
# the legacy DMS export of this table). The cron writes via raw SQL and does not
# use this class. All columns are public curriculum metadata.
# == Schema Information
#
# Table name: contained_levels
#
#  id                       :integer          not null, primary key
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  level_group_level_id     :integer          not null
#  contained_level_id       :integer          not null
#  contained_level_type     :string(255)      not null
#  contained_level_page     :integer          not null
#  contained_level_position :integer          not null
#  contained_level_text     :text(65535)
#
# Indexes
#
#  index_contained_levels_on_contained_level_id    (contained_level_id)
#  index_contained_levels_on_level_group_level_id  (level_group_level_id)
#
class ContainedLevel < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :public,
    created_at: :public,
    updated_at: :public,
    level_group_level_id: :public,
    contained_level_id: :public,
    contained_level_type: :public,
    contained_level_page: :public,
    contained_level_position: :public,
    contained_level_text: :public,
  )
end
