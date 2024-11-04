# == Schema Information
#
# Table name: user_level_interactions
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  level_id     :integer          not null
#  script_id    :integer          not null
#  school_year  :string(255)      not null
#  interaction  :string(255)      not null
#  code_version :string(255)
#  metadata     :json
#  deleted_at   :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_user_level_interactions_on_level_id  (level_id)
#  index_user_level_interactions_on_user_id   (user_id)
#
class UserLevelInteraction < ApplicationRecord
end
