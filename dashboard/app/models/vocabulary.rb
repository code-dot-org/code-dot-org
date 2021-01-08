# == Schema Information
#
# Table name: vocabularies
#
#  id                :bigint           not null, primary key
#  key               :string(255)      not null
#  word              :string(255)      not null
#  definition        :text(65535)      not null
#  course_version_id :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_vocabularies_on_key_and_course_version_id  (key,course_version_id) UNIQUE
#  index_vocabularies_on_word_and_definition        (word,definition)
#
class Vocabulary < ApplicationRecord
  belongs_to :course_version
end
