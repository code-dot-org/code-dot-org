# == Schema Information
#
# Table name: hidden_promotions
#
#  id           :bigint           not null, primary key
#  promotion_id :string(255)      not null
#  teacher_id   :integer          not null
#  deleted_at   :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_hidden_promotions_on_deleted_at  (deleted_at)
#  index_hidden_promotions_on_teacher_id  (teacher_id)
#
class HiddenPromotion < ApplicationRecord
  acts_as_paranoid

  belongs_to :teacher, class_name: 'User'

  validates :promotion_id, presence: true
end
