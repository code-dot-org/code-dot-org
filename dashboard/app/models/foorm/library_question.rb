# == Schema Information
#
# Table name: foorm_library_questions
#
#  id              :integer          not null, primary key
#  library_name    :string(255)      not null
#  library_version :integer          not null
#  question_name   :string(255)      not null
#  question        :text(65535)      not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  published       :boolean          default(TRUE), not null
#
# Indexes
#
#  index_foorm_library_questions_on_multiple_fields  (library_name,library_version,question_name) UNIQUE
#

class Foorm::LibraryQuestion < ApplicationRecord
  include Seeded

  belongs_to :library, primary_key: [:name, :version], foreign_key: [:library_name, :library_version], required: true

  validate :validate_library_question

  after_save :write_to_file

  def validate_library_question
    Foorm::Form.validate_element(JSON.parse(question).deep_symbolize_keys, Set.new)
  rescue StandardError => e
    errors.add(:question, e.message)
  end

  def write_to_file
    return true unless saved_changes?
    library.write_library_to_file
  end
end
