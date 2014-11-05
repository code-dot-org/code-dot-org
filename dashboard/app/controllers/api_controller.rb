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
    @section_map = {@section => @section.students}

    @all_script_levels = @script.script_levels.includes({ level: :game })

    @all_concepts = Concept.cached

    @all_games = Game.where(['id in (select game_id from levels l inner join script_levels sl on sl.level_id = l.id where sl.script_id = ?)', @script.id])

    student_ids = @section.students.pluck(:id)
    @recent_activities = Activity.recent(30).where("user_id in (?)", student_ids)
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
