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
class Quiz < Level
  has_many :quiz_level_questions,
    -> {order(:page_number, :position)},
    foreign_key: :level_id,
    dependent: :destroy
  has_many :quiz_questions, through: :quiz_level_questions

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.quiz,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    level_properties = super
    level_properties[:surveyJson] = {pages: survey_pages}
    level_properties[:scriptId] = script&.id
    level_properties
  end

  private def survey_pages
    quiz_level_questions.includes(:quiz_question).group_by(&:page_number).values.map do |page_qlqs|
      {elements: page_qlqs.map {|qlq| survey_element_for(qlq.quiz_question)}}
    end
  end

  private def survey_element_for(question)
    question.survey_element.merge(
      'type' => question.question_type,
      'name' => "q_#{question.id}",
    )
  end
end
