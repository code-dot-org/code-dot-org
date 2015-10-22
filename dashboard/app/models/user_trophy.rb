# == Schema Information
#
# Table name: user_trophies
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  trophy_id  :integer          not null
#  concept_id :integer
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_user_trophies_on_user_id_and_trophy_id_and_concept_id  (user_id,trophy_id,concept_id) UNIQUE
#

class UserTrophy < ActiveRecord::Base
  belongs_to :user
  belongs_to :trophy
  belongs_to :concept
end
