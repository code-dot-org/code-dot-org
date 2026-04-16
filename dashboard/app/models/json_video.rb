# == Schema Information
#
# Table name: json_videos
#
#  id          :bigint           not null, primary key
#  key         :string(255)      not null
#  description :string(255)
#  s3_uri      :string(255)      not null
#  lab         :string(255)
#  version     :integer          not null
#  audience    :string(255)      not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_json_videos_on_key  (key) UNIQUE
#

class JSONVideo < ApplicationRecord
  validates :key, presence: true, uniqueness: true
  validates :s3_uri, presence: true
  validates :version, presence: true
  validates :audience, presence: true
end
