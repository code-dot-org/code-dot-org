class PrizeProvider < ActiveRecord::Base
  include Seeded
  has_many :prizes
  has_many :teacher_prizes
  has_many :teacher_bonus_prizes
end
