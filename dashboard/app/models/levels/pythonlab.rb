# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#
class Pythonlab < Level
  serialized_attrs %w(
    start_sources
    encrypted_exemplar_sources
    hide_share_and_remix
    is_project_level
    submittable
    starter_assets
    predict_settings
  )

  validate :has_correct_multiple_choice_answer?
  before_save :clean_up_predict_settings

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.pythonlab,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  # Ensure that if this is a multiple choice predict level, there is at least one correct answer
  # specified.
  def has_correct_multiple_choice_answer?
    if predict_settings && predict_settings["isPredictLevel"] && predict_settings["questionType"] == 'multipleChoice'
      options = predict_settings["multipleChoiceOptions"]
      answers = predict_settings["solution"]
      unless options && answers && !options.empty? && answers.present?
        errors.add(:predict_settings, 'multiple choice questions must have at least one correct answer')
      end
    end
  end

  def clean_up_predict_settings
    return unless predict_settings
    if !predict_settings["isPredictLevel"]
      # If this is not a predict level, remove any predict settings that may have been set.
      self.predict_settings = {isPredictLevel: false}
    elsif predict_settings["questionType"] == 'multipleChoice'
      # Remove any free response settings if this is a multiple choice question.
      predict_settings.delete("placeholderText")
      predict_settings.delete("freeResponseHeight")
    else
      # Remove any multiple choice settings if this is a free response question.
      predict_settings.delete("multipleChoiceOptions")
    end
  end

  # Return the validation condition for this level. If the level has a validation file, the condition
  # is that all tests passed. If there is no validation file, there are no conditions.
  def get_validations
    has_validation = start_sources && start_sources["files"]&.any? {|(_, file)| file["type"] == 'validation'}
    if has_validation
      [{
        conditions: [
          {
            name: 'PASSED_ALL_TESTS',
            value: "true"
          }
        ],
        message: '',
        next: true,
      }]
    else
      nil
    end
  end
end
