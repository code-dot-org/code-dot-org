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
      @section_summary = @section.selected_section_summarize.except('secret_words')
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

  def parent_letter
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    render layout: false
  end

  def get_drawer_data
    show_school_info_interstitial = SchoolInfoInterstitialHelper.show?(current_user)
    show_school_info_confirmation = SchoolInfoInterstitialHelper.show_confirmation_dialog?(current_user)
    school_info = Queries::SchoolInfo.current_school(current_user)

    unless current_user.donor_teacher_banner_dismissed
      afe_eligible = current_user&.school_info&.school&.afe_high_needs?
    end

    SchoolInfoInterstitialHelper.update_last_seen_timestamp(current_user)

    render json: {
      showSchoolInfoInterstitial: show_school_info_interstitial,
      showSchoolInfoConfirmation: show_school_info_confirmation,
      existingSchoolInfo: school_info,
      afeEligible: afe_eligible,
    }
  end
end
