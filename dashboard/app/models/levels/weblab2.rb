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
#  index_levels_on_type       (type)
#
class Weblab2 < Level
  validate :validate_ai_tutor_prompt_answer_types

  serialized_attrs %w(
    start_sources
    hide_share_and_remix
    is_project_level
    encrypted_exemplar_sources
    submittable
    validation_enabled
    widget_view
    initial_view_mode
    disable_edit_run_for_submission
    predict_settings
    ai_tutor_mode
    level_system_prompt
    ai_tutor_prompt_answer_types
    widget2
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.weblab2,
        level_num: 'custom',
      )
    )
  end

  def self.view_modes
    [['Code + Preview (default)', 'split'], ['Preview only', 'preview'], ['Code only', 'code']]
  end

  def self.ai_tutor_modes
    [['Suggest', 'suggest'], ['Outline', 'outline'], ['Guide', 'guide'], ['Produce', 'produce'], ['Designer', 'designer'], ['Tutor', 'tutor'], ['Engineer', 'engineer'], ['QA', 'qa']]
  end

  def uses_lab2?
    true
  end

  def add_starter_asset!(_, _)
    true
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil, widget2_start_sources: nil)
    properties_camelized = super(script, script_level, current_user, unit_group_unit: unit_group_unit)

    # If this is a widget2 level or we are editing widget2 starter sources,
    # then startSources will come from the files in the repo, rather than
    # that serialized into the level file.
    widget2_id = properties["widget2"] || widget2_start_sources
    if widget2_id
      properties_camelized[:startSources] = get_widget2_sources(widget2_id)
    end

    # And if this is a widget2 level, then show it as a widget.
    if properties["widget2"]
      properties_camelized[:widgetView] = true
    end

    properties_camelized
  end

  private def validate_ai_tutor_prompt_answer_types
    return if ai_tutor_prompt_answer_types.nil?
    unless ai_tutor_prompt_answer_types.is_a?(Array) &&
        ai_tutor_prompt_answer_types.length >= 1 &&
        ai_tutor_prompt_answer_types.all?(String)
      errors.add(:ai_tutor_prompt_answer_types, 'must contain at least one answer type.')
    end
  end
end
