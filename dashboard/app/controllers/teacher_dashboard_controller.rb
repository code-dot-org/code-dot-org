require 'census_helper'
require_dependency 'queries/school_info'
require_dependency 'queries/script_activity'

class TeacherDashboardController < ApplicationController
  include UsersHelper
  include SurveyResultsHelper
  include TeacherApplicationHelper
  include IncubatorHelper

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
    unless @section.nil?
      @section_summary = @section.selected_section_summarize
      @sections = current_user.sections_instructed.map(&:concise_summarize)
    end
    if request.original_url.include? '/home'
      init_homepage
    end
    @locale_code = request.locale
    view_options(full_width: true, no_padding_container: true)
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

  # Set all local variables needed to render the signed-in homepage.
  # @raise if called when the user is not signed in.
  private def init_homepage
    raise 'init_homepage can only be called when there is a current_user' unless current_user

    view_options(full_width: true, responsive_content: false, no_padding_container: true, has_i18n: true)

    @homepage_data = {}
    @homepage_data[:isEnglish] = request.language == 'en'
    @homepage_data[:locale] = Unit.locale_english_name_map[request.locale]
    @homepage_data[:localeCode] = request.locale
    @homepage_data[:canViewAdvancedTools] = !(current_user.under_13? && current_user.terms_version.nil?)
    @homepage_data[:providers] = current_user.providers
    @homepage_data[:mapboxAccessToken] = CDO.mapbox_access_token
    @homepage_data[:currentUserId] = current_user.id

    current_user_permissions = UserPermission.where(user_id: current_user.id).pluck(:permission)
    @homepage_data[:showStudentAsVerifiedTeacherWarning] = current_user.student? && current_user_permissions.include?(UserPermission::AUTHORIZED_TEACHER)

    @force_race_interstitial = params[:forceRaceInterstitial]
    @force_school_info_confirmation_dialog = params[:forceSchoolInfoConfirmationDialog]
    @force_school_info_interstitial = params[:forceSchoolInfoInterstitial]
    @show_school_info_interstitial = params[:showSchoolInfoInterstitial]
    @show_section_creation_celebration_dialog = params[:showSectionCreationDialog]

    student_sections = current_user.sections_as_student.map(&:summarize_without_students)

    # Students and teachers will receive a @top_course for their primary
    # script, so we don't want to include that script (if it exists) in the
    # regular lists of recent scripts.
    exclude_primary_script = true
    @homepage_data[:courses] = current_user.recent_student_courses_and_units(exclude_primary_script)

    @homepage_data[:hasFeedback] = TeacherFeedback.has_feedback?(current_user.id)

    script = Queries::ScriptActivity.primary_student_unit(current_user)
    if script
      script_level = current_user.next_unpassed_progression_level(script)
    end
    @homepage_data[:topCourse] = nil
    if script && script_level
      @homepage_data[:topCourse] = {
        assignableName: data_t_suffix('script.name', script[:name], 'title'),
        lessonName: script_level.lesson.localized_title,
        linkToOverview: script_path(script),
        linkToLesson: script_next_path(script, 'next')
      }
    end

    if current_user.teacher?
      # Teachers will receive a topPlCourse for their primary
      # unit, so we don't want to include that unit (if it exists) in the
      # regular lists of recent units.
      exclude_primary_script = true
      @homepage_data[:plCourses] = current_user.recent_pl_courses_and_units(exclude_primary_script)

      pl_unit = Queries::ScriptActivity.primary_pl_unit(current_user)
      if pl_unit
        pl_script_level = current_user.next_unpassed_progression_level(pl_unit)
      end
      @homepage_data[:topPlCourse] = nil
      if pl_unit && pl_script_level
        @homepage_data[:topPlCourse] = {
          assignableName: data_t_suffix('script.name', pl_unit[:name], 'title'),
          lessonName: pl_script_level.lesson.localized_title,
          linkToOverview: script_path(pl_unit),
          linkToLesson: script_next_path(pl_unit, 'next')
        }
      end

      unless current_user.donor_teacher_banner_dismissed
        afe_eligible = current_user&.school_info&.school&.afe_high_needs?
      end

      afe_eligible ||= params[:forceAFEBanner]
      show_census_banner = !!current_user.show_census_teacher_banner?

      # The following cookies are used by marketing to create personalized experiences for teachers, such as displaying
      # specific banner content.
      current_user.marketing_segment_data&.compact&.each do |segment_name, value|
        cookies[environment_specific_cookie_name("_teacher_#{segment_name}")] = {value: value, domain: :all}
      end

      @homepage_data[:isTeacher] = true
      @homepage_data[:hocLaunch] = DCDO.get('hoc_launch', CDO.default_hoc_launch)
      @homepage_data[:joined_student_sections] = current_user&.sections_as_student_participant&.map(&:summarize_without_students)
      @homepage_data[:joined_pl_sections] = current_user&.sections_as_pl_participant&.map(&:summarize_without_students)
      @homepage_data[:announcement] = DCDO.get('announcement_override', nil)
      @homepage_data[:hiddenScripts] = current_user.get_hidden_unit_ids
      @homepage_data[:showCensusBanner] = show_census_banner
      @homepage_data[:showNpsSurvey] = show_nps_survey?
      @homepage_data[:showFinishTeacherApplication] = has_incomplete_open_application?
      @homepage_data[:showReturnToReopenedTeacherApplication] = has_reopened_application?
      @homepage_data[:afeEligible] = afe_eligible
      @homepage_data[:specialAnnouncement] = Announcements.get_localized_announcement_for_page("/home")
      @homepage_data[:showIncubatorBanner] = show_incubator_banner?

      if show_census_banner
        teachers_school = current_user.school_info_school
        school_stats = SchoolStatsByYear.where(school_id: teachers_school.id).order(school_year: :desc).first

        @homepage_data[:censusQuestion] = school_stats.try(:has_high_school_grades?) ? "how_many_20_hours" : "how_many_10_hours"
        @homepage_data[:currentSchoolYear] = current_census_year
        @homepage_data[:existingSchoolInfo] = {
          id: teachers_school.id,
          name: teachers_school.name,
          country: 'US',
          zip: teachers_school.zip,
          type: teachers_school.school_type,
        }
        @homepage_data[:ncesSchoolId] = teachers_school.id
        @homepage_data[:teacherName] = current_user.name
        @homepage_data[:teacherId] = current_user.id
        @homepage_data[:teacherEmail] = current_user.email
      end
    else
      @homepage_data[:isTeacher] = false
      @homepage_data[:sections] = student_sections
      @homepage_data[:studentId] = current_user.id
      @homepage_data[:studentSpecialAnnouncement] = Announcements.get_localized_announcement_for_page("/student-home")
      @homepage_data[:parentalPermissionBanner] = helpers.parental_permission_banner_data(current_user, request)
    end
  end
end
