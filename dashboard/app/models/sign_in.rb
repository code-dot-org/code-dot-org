# == Schema Information
#
# Table name: sign_ins
#
#  id            :integer          not null, primary key
#  user_id       :integer          not null
#  sign_in_at    :datetime         not null
#  sign_in_count :integer          not null
#
# Indexes
#
#  index_sign_ins_on_sign_in_at  (sign_in_at)
#  index_sign_ins_on_user_id     (user_id)
#

class SignIn < ApplicationRecord
  belongs_to :user
end
