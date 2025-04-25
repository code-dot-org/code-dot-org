class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  rescue_from CanCan::AccessDenied do
    if params[:path]&.include? 'courses'
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
    pp 'lfm', params[:section_id], params
    headers = ['student_name', 'level1']
    fake_data = [{student_name: 'anna', level1: 'in progress'}, {student_name: 'beth', level1: 'in progress'}]
    send_data(
      CSV.generate do |csv|
        csv << headers
        fake_data.each do |data|
          csv << [
            data[:student_name],
            data[:level1]
          ]
        end
      end,
      filename: 'progress.csv',
      disposition: 'attachment',
      type: 'text/csv',
    )
  end
end
