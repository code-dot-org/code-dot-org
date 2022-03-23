# == Schema Information
#
# Table name: user_ml_models
#
#  id         :bigint           not null, primary key
#  user_id    :integer
#  model_id   :string(255)
#  name       :string(255)
#  deleted_at :datetime
#  purged_at  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  metadata   :text(65535)
#
# Indexes
#
#  index_user_ml_models_on_model_id  (model_id)
#  index_user_ml_models_on_user_id   (user_id)
#
class UserMlModel < ApplicationRecord
  belongs_to :user
  validates :name, presence: true

  # Model ids are 12-character random alphanumeric strings.
  def self.generate_id
    SecureRandom.alphanumeric(12)
  end

  def self.valid_model_id?(id)
    return false if id.length != 12
    !id.match?(/[^a-zA-Z0-9]/)
  end
end
