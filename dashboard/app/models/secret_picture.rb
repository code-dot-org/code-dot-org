# == Schema Information
#
# Table name: secret_pictures
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  path       :string(255)      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_secret_pictures_on_name  (name) UNIQUE
#  index_secret_pictures_on_path  (path) UNIQUE
#

class SecretPicture < ApplicationRecord
  include Seeded

  def self.setup
    secret_pictures = load_csv Dashboard::Application.config.secret_pictures_csv
    transaction do
      reset_db
      SecretPicture.import! secret_pictures
    end
  end

  def self.random
    raise "there are no SecretPictures! Do you need to rake seed:secret_pictures?" if count <= 0
    # assumes that there are no holes in the ids!
    # 0 <= random_number < n
    find(SecureRandom.random_number(count) + 1)
  end
end
