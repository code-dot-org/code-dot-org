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

class SecretPicture < ActiveRecord::Base
  include Seeded

  def self.setup
    self.transaction do
      reset_db
      load_csv(Dashboard::Application.config.secret_pictures_csv) do |attrs|
        self.create!(attrs)
      end
    end
  end

  def self.random
    raise "there are no SecretPictures! Do you need to rake seed:secret_pictures?" if self.count <= 0
    # assumes that there are no holes in the ids!
    # 0 <= random_number < n
    self.find(SecureRandom.random_number(self.count) + 1)
  end

end
