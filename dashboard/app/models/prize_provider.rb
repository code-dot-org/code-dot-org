# == Schema Information
#
# Table name: prize_providers
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  url               :string(255)
#  description_token :string(255)
#  image_name        :string(255)
#  created_at        :datetime
#  updated_at        :datetime
#

class PrizeProvider < ActiveRecord::Base
  include Seeded
  has_many :prizes
  has_many :teacher_prizes
  has_many :teacher_bonus_prizes
end
