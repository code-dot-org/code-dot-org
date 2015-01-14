class ApiController < ApplicationController
  layout false

  def user_menu
  end

  def user_hero
  end

  def section_progress
    @section = Section.find(params[:id])
    authorize! :read, @section

    @script = @section.script || Script.twenty_hour_script

    # stage data
    stages = @script.script_levels.group_by(&:stage_or_game).map do |stage_or_game, levels|
      {length: levels.length,
       title: ActionController::Base.helpers.strip_tags(stage_title(@script, stage_or_game))}
    end

    # student level completion data
    students = @section.students.map do |student|
      level_map = student.user_levels.index_by {|ul| ul.level_id }
      student_levels = []
      @script.script_levels.each do |script_level|
        if user_level = level_map[script_level.level_id]
          student_levels << {class: activity_css_class(user_level.try(:best_result)),
                             title: script_level.stage_or_game_position}
        else
          student_levels << nil
        end
      end   
      {id: student.id, levels: student_levels}
    end


    data = {
            students: students,
            script: {
                     name: data_t_suffix('script.name', @script.name, 'title'),
                     levels_count: @script.script_levels.length,
                     stages: stages
                    }
           }

    render text: data.to_json
    # This really should be:
    # render json: data
    # but it doesn't work because we have some CSRF "protection" thing
  end

  def student_progress
    @student = User.find(params[:id])
    authorize! :read, @student

    @section = Section.find(params[:section_id])
    authorize! :read, @section

    @script = @section.script || Script.twenty_hour_script

    @recent_levels = UserLevel.find_by_sql(<<SQL)
select ul.*, sl.game_chapter, l.game_id, sl.chapter, sl.script_id, sl.id as script_level_id
from user_levels ul
inner join script_levels sl on sl.level_id = ul.level_id
inner join levels l on l.id = ul.level_id
where sl.script_id = #{@script.id} and ul.user_id = #{@student.id}
order by ul.updated_at desc limit 2
SQL

  end
end
