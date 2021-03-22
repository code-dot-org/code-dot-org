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
  validates :question_name, :question, presence: true

  after_commit :write_to_file

  # Before saving updates to a library question, we check whether the library question
  # is used in any published forms, such that we can warn the editor that
  # their changes may affect surveys that are already in use.
  def published_forms_appeared_in
    Set.new.tap do |forms_appeared_in|
      Foorm::Form.all.each do |form|
        next unless form.published
        JSON.parse(form.questions)['pages']&.each do |page|
          page['elements']&.each do |element|
            forms_appeared_in << form if element['type'] == 'library_item' && element['name'] == question_name
          end
        end
      end
    end
  end

  # TO DO: names need to be tracked in the question column (and JSON) to make sure libraries continue to be valid SurveyJS.
  # TO DO: check that the library question has the same name in the question as in the question_name field.
  # TO DO: check that the library question name is unique within the library (there is DB validation for this)
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
