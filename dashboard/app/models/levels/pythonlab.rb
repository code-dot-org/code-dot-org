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
    contained_level_names
    is_predict_level
    predict_placeholder_text
    predict_solution
    predict_question_type
    predict_question_options
    predict_single_correct_answer
  )

  def self.predict_question_types
    [['Free response', 'free_response'], ['Multiple choice', 'multiple_choice']]
  end

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
end
