require 'census_helper'
require_dependency 'queries/school_info'
require_dependency 'queries/script_activity'

class HomeController < ApplicationController
  include BrandRegionHelper
  include UsersHelper
  include SurveyResultsHelper
  include TeacherApplicationHelper
  include IncubatorHelper

  # Don't require an authenticity token on set_locale because we post to that
  # action from publicly cached page without a valid token. The worst case impact
  # is that an attacker could change a user's language if they fooled them into
  # clicking on a link.
  skip_before_action :verify_authenticity_token, only: 'set_locale'

  # The terms_and_privacy page gets loaded in an iframe on the signup page, so skip
  # clearing the sign up tracking variables
  skip_before_action :clear_sign_up_session_vars, only: [:terms_and_privacy]
  skip_before_action :initialize_statsig_session, only: [:health_check]

  def set_locale
    set_locale_cookie(params[:locale]) if params[:locale]
    redirect_path = if params[:i18npath]
                      "/#{params[:i18npath]}"
                    elsif params[:user_return_to]
                      URI.parse(params[:user_return_to].to_s).path
                    else
                      '/'
                    end
    # Query parameter for browser cache to be avoided and load new locale
    redirect_path = "#{redirect_path}?lang=#{params[:locale]}" if params[:locale]
    redirect_to redirect_path
  rescue URI::InvalidURIError
    redirect_to '/'
  end

  def home_insert
    if current_user
      render 'index', layout: false, formats: [:html]
    else
      render plain: ''
    end
  end

  def health_check
    render plain: 'healthy!'
  end

  # Signed in student, with an assigned course/script: redirect to course overview page
  # Note: the student will be redirected to the course or script in which they
  # most recently made progress, which may not be an assigned course or script.
  # Signed in student or teacher, without an assigned course/script: redirect to /home
  # Signed out: redirect to /users/sign_in
  def index
    if current_user
      if should_redirect_to_script_overview?
        redirect_to script_path(current_user.most_recently_assigned_script)
      else
        redirect_to '/home'
      end
    else
      redirect_to '/users/sign_in'
    end
  end

  # Signed in: render home page
  # Signed out: redirect to sign in
  def home
    authenticate_user!
    init_homepage
    render 'home/index'
  end

  # This static page combines TOS and Privacy partials all in one page
  # for easy printing.
  def terms_and_privacy
    render partial: 'home/tos_and_privacy'
  end

  # Determine where student should be redirected upon logging in:
  # true (redirect to script overview page) - if the user is a student && can access the script
  #   they were most recently assigned && they either have no recorded recent progress, their most
  #   recent progress was in the most recently assigned script, or they were assigned the script
  #   more recently than their last progress in another section.
  # false (redirect to student homepage) - otherwise.
  private def should_redirect_to_script_overview?
    current_user.student? &&
      current_user.can_access_most_recently_assigned_script? &&
      current_user.most_recent_assigned_script_in_live_section? &&
      (
        !current_user.user_script_with_most_recent_progress ||
        current_user.most_recent_progress_in_recently_assigned_script? ||
        current_user.last_assignment_after_most_recent_progress?
      )
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
    @homepage_data[:currentSku] = current_brand_region

    current_user_permissions = UserPermission.where(user_id: current_user.id).pluck(:permission)
    @homepage_data[:showStudentAsVerifiedTeacherWarning] = current_user.student? && current_user_permissions.include?(UserPermission::AUTHORIZED_TEACHER)

    # DCDO Flag - show/hide Lock Section field - Can/Will be overwritten by DCDO.
    @homepage_data[:showLockSectionField] = DCDO.get('show_lock_section_field', true)

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
      @homepage_data[:specialAnnouncement] = Announcements.get_localized_announcement_for_page("/home") if current_brand_region == "global"
      @homepage_data[:showIncubatorBanner] = show_incubator_banner?

      if show_census_banner
        teachers_school = current_user.school_info.school
        school_stats = SchoolStatsByYear.where(school_id: teachers_school.id).order(school_year: :desc).first

        @homepage_data[:censusQuestion] = school_stats.try(:has_high_school_grades?) ? "how_many_20_hours" : "how_many_10_hours"
        @homepage_data[:currentSchoolYear] = current_census_year
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

    if current_user.school_donor_name
      donor_footer_options = {}
      donor_footer_options[:donorName] = current_user.school_donor_name
      donor_footer_options[:logos] = Dir.glob("app/assets/images/donor_logos/#{current_user.school_donor_name}/*").sort

      @homepage_data[:donorFooterOptions] = donor_footer_options
    end
  end
end
