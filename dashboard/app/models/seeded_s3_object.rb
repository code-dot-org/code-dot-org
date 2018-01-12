# == Schema Information
#
# Table name: seeded_s3_objects
#
#  id         :integer          not null, primary key
#  bucket     :string(255)
#  key        :string(255)
#  etag       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_seeded_s3_objects_on_bucket_and_key_and_etag  (bucket,key,etag)
#

class SeededS3Object < ApplicationRecord
end
