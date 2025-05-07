class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section
  include LevelsHelper

  ALPHABET = ('a'..'z').to_a

  rescue_from CanCan::AccessDenied do
    if request.fullpath.include? 'home'
      redirect_to "/users/sign_in"
    elsif params[:path]&.include? 'courses'
      redirect_to "/#{params[:path]}"
    elsif params[:path]&.include? 'unit'
      params[:path].sub! 'unit', 's'
      redirect_to "/#{params[:path]}"
    else
      redirect_to "/home"
    end
  end

  def show
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    unless @sections.empty?
      if @section.nil?
        @section = Section.find(@sections.first[:id])
      end
      @section_summary = @section.selected_section_summarize
    end
    @section_order = UserPreference.find_by(user_id: current_user.id)&.section_order
    @locale_code = request.locale
    view_options(full_width: true, no_padding_container: true)
  end

  def redirect_to_newest_section
    if current_user.sections_instructed.empty?
      redirect_to "/home"
    else
      section_id = current_user.sections_instructed.order(created_at: :desc).first.id
      redirect_to "/teacher_dashboard/sections/#{section_id}/#{params[:location]}"
    end
  end

  def redirect_to_newest_section_progress
    if current_user.sections_instructed.empty?
      redirect_to "https://support.code.org/hc/en-us/articles/25195525766669-Getting-Started-New-Progress-View"
    else
      section_id = current_user.sections_instructed.order(created_at: :desc).first.id
      redirect_to "/teacher_dashboard/sections/#{section_id}/progress?view=v2"
    end
  end

  def enable_experiments
    if current_user.sections_instructed.empty?
      redirect_to "/home"
    else

      section_id = current_user.sections_instructed.order(created_at: :desc).first.id
      redirect_to "/teacher_dashboard/sections/#{section_id}/progress?enableExperiments=teacher-local-nav-v2"
    end
  end

  def disable_experiments
    if current_user.sections_instructed.empty?
      redirect_to "/home"
    else

      section_id = current_user.sections_instructed.order(created_at: :desc).first.id
      redirect_to "/teacher_dashboard/sections/#{section_id}/progress?disableExperiments=teacher-local-nav-v2"
    end
  end

  def parent_letter
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    render layout: false
  end

  def download_progress_csv
    type = params[:type]

    return head :bad_request unless type == 'level'

    level_progress_csv if type == 'level'
  end

  private def level_progress_csv
    return :bad_request unless params[:unit_id]

    unit = Unit.get_from_cache(params[:unit_id])

    deduplicated_students = @section.students.distinct

    student_progress = script_progress_for_users(deduplicated_students, unit)[0]

    level_names, progress_table = get_csv_level_data(unit, deduplicated_students, student_progress)

    headers = ['Student Name'].concat(level_names)
    send_data(
      CSV.generate do |csv|
        csv << headers
        progress_table.each do |data_row|
          csv << [data_row[:student_name]].concat(level_names.map {|column_name| data_row[column_name]})
        end
      end,
      filename: 'level_progress.csv',
      disposition: 'attachment',
      type: 'text/csv',
    )
  end

  private def get_csv_level_data(unit, students, student_progress)
    progress_table = students.map do |student|
      {student_name: student.family_name ? "#{student.name} #{student.family_name}" : student.name, student_id: student.id}
    end

    level_names = []

    unit.lessons.each do |lesson|
      lesson.script_levels.each do |script_level|
        next if script_level.assessment?

        level_id = script_level.oldest_active_level.id || script_level.id
        level_text = "#{lesson.relative_position}.#{script_level.level_display_text}"

        if script_level.bubble_choice?
          sublevels = script_level.level.sublevels
          sublevels.each_with_index do |sublevel, index|
            sublevel_name = "#{level_text}#{ALPHABET[index]}"
            level_names << sublevel_name

            add_level_data_for_all_students(progress_table, student_progress, sublevel.id, sublevel_name, sublevel.validated?)
          end
        else
          add_level_data_for_all_students(progress_table, student_progress, level_id, level_text, script_level.level.validated?)
          level_names << level_text
        end
      end
    end

    [level_names, progress_table]
  end

  private def add_level_data_for_all_students(progress_table, student_progress, level_id, level_text, is_validated_level)
    progress_table.each do |data_row|
      level_progress_for_student = student_progress[data_row[:student_id]][level_id]

      status = level_progress_for_student ? level_progress_for_student[:status] : 'not_tried'

      parsed_status = case status
                      when 'not_tried'
                        I18n.t('progress.not_started').capitalize
                      when 'passed', 'perfect', 'submitted', 'completed_assessment', 'free_play_complete'
                        if is_validated_level
                          I18n.t('progress.validated').capitalize
                        else
                          I18n.t('progress.submitted').capitalize
                        end
                      when 'attempted'
                        I18n.t('progress.attempted').capitalize
                      end

      data_row[level_text] = parsed_status
    end
  end
end
