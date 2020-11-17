# == Schema Information
#
# Table name: user_ml_models
#
#  id         :bigint           not null, primary key
#  user_id    :integer
#  model_id   :string(255)
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
FactoryGirl.define do
  factory :user_ml_model do
    user_id ""
    model_id "MyString"
    model_name "MyString"
  end
end
