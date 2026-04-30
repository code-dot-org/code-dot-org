# == Schema Information
#
# Table name: user_product_tours
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  tour_name    :string(255)      not null
#  completed_at :datetime         not null
#
# Indexes
#
#  index_user_product_tours_on_user_id_and_tour_name  (user_id,tour_name) UNIQUE
#

class UserProductTour < ApplicationRecord
  belongs_to :user

  VALID_TOUR_NAMES = [
    CREATE_CLASS_SECTION = 'create_class_section'.freeze,
  ].freeze

  validates :tour_name, inclusion: {in: VALID_TOUR_NAMES}
  validates :tour_name, uniqueness: {scope: :user_id}
end
