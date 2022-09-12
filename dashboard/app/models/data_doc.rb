# == Schema Information
#
# Table name: data_docs
#
#  id         :bigint           not null, primary key
#  key        :string(255)      not null
#  name       :string(255)
#  content    :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_data_docs_on_key   (key) UNIQUE
#  index_data_docs_on_name  (name)
#
class DataDoc < ApplicationRecord
  include CurriculumHelper

  validates_uniqueness_of :key, case_sensitive: false
  validate :validate_key_format
end
