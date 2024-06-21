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
    encrypted_validation
    hide_share_and_remix
    is_project_level
    submittable
    starter_assets
    predict_settings
  )

  validate :has_correct_multiple_choice_answer?

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
    if predict_settings && predict_settings[:is_predict_level] && predict_settings[:question_type] == 'multiple_choice'
      options = predict_settings[:multiple_choice_options]
      answers = predict_settings[:multiple_choice_answers]
      unless options && answers && !options.empty? && !answers.empty?
        errors.add(:predict_settings, 'multiple choice questions must have at least one correct answer')
      end
    end
  end
end
