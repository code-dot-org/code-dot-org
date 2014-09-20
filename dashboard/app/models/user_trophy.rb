class UserTrophy < ActiveRecord::Base
  belongs_to :user
  belongs_to :trophy
  belongs_to :concept
end
