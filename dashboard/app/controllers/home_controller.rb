require 'census_helper'
require_dependency 'queries/school_info'
require_dependency 'queries/script_activity'

class HomeController < ApplicationController
  include UsersHelper

  # Don't require an authenticity token on set_locale because we post to that
  # action from publicly cached page without a valid token. The worst case impact
  # is that an attacker could change a user's language if they fooled them into
  # clicking on a link.
  skip_before_action :verify_authenticity_token, only: 'set_locale'

  # The terms_and_privacy page gets loaded in an iframe on the signup page, so skip
  # clearing the sign up tracking variables
  skip_before_action :clear_sign_up_session_vars, only: [:terms_and_privacy]

  def set_locale
    set_locale_cookie(params[:locale]) if params[:locale]
    if params[:i18npath]
      redirect_to "/#{params[:i18npath]}"
    elsif params[:user_return_to]
      redirect_to URI.parse(params[:user_return_to].to_s).path
    else
      redirect_to '/'
    end
  rescue URI::InvalidURIError
    redirect_to '/'
  end

  def home_insert
    if current_user
      render 'index', layout: false, formats: [:html]
    else
      render text: ''
    end
  end

  def health_check
    render text: 'healthy!'
  end

  # Signed in student, with an assigned course/script: redirect to course overview page
  # Note: the student will be redirected to the course or script in which they
  # most recently made progress, which may not be an assigned course or script.
  # Signed in student or teacher, without an assigned course/script: redirect to /home
  # Signed out: redirect to /courses
  def index
    if current_user
      if should_redirect_to_script_overview?
        redirect_to script_path(current_user.most_recently_assigned_script)
      else
        redirect_to '/home'
      end
    else
      redirect_to '/courses'
    end
  end

  # Signed in: render home page
  # Signed out: redirect to sign in
  def home
    authenticate_user!
    init_homepage
    render 'home/index'
  end

  def certificate_link_test
    render 'certificate_link_test', formats: [:html]
  end

  # This static page combines TOS and Privacy partials all in one page
  # for easy printing.
  def terms_and_privacy
    render partial: 'home/tos_and_privacy'
  end

  private

  def should_redirect_to_script_overview?
    current_user.student? &&
    current_user.can_access_most_recently_assigned_script? &&
    (
      !current_user.user_script_with_most_recent_progress ||
      current_user.most_recent_progress_in_recently_assigned_script? ||
      current_user.last_assignment_after_most_recent_progress?
    )
  end

  # Set all local variables needed to render the signed-in homepage.
  # @raise if called when the user is not signed in.
  def init_homepage
    raise 'init_homepage can only be called when there is a current_user' unless current_user

    @homepage_data = {}
    @homepage_data[:valid_grades] = Section.valid_grades
    @homepage_data[:lessonExtrasScriptIds] = Script.lesson_extras_script_ids
    @homepage_data[:isEnglish] = request.language == 'en'
    @homepage_data[:locale] = Script.locale_english_name_map[request.locale]
    @homepage_data[:canViewAdvancedTools] = !(current_user.under_13? && current_user.terms_version.nil?)
    @homepage_data[:providers] = current_user.providers

    @force_race_interstitial = params[:forceRaceInterstitial]
    @force_school_info_confirmation_dialog = params[:forceSchoolInfoConfirmationDialog]
    @force_school_info_interstitial = params[:forceSchoolInfoInterstitial]

    student_sections = current_user.sections_as_student.map(&:summarize_without_students)

    # Students and teachers will receive a @top_course for their primary
    # script, so we don't want to include that script (if it exists) in the
    # regular lists of recent scripts.
    exclude_primary_script = true
    @homepage_data[:courses] = current_user.recent_courses_and_scripts(exclude_primary_script)

    @homepage_data[:hasFeedback] = current_user.student? && TeacherFeedback.where(
      student_id: current_user.id
    ).count > 0

    script = Queries::ScriptActivity.primary_script(current_user)
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
      unless current_user.donor_teacher_banner_dismissed
        donor_banner_name = current_user.school_donor_name
      end

      donor_banner_name ||= params[:forceDonorTeacherBanner]
      show_census_banner = !!(!donor_banner_name && current_user.show_census_teacher_banner?)

      @homepage_data[:isTeacher] = true
      @homepage_data[:hocLaunch] = DCDO.get('hoc_launch', CDO.default_hoc_launch)
      @homepage_data[:joined_sections] = student_sections
      @homepage_data[:announcement] = DCDO.get('announcement_override', nil)
      @homepage_data[:hiddenScripts] = current_user.get_hidden_script_ids
      @homepage_data[:showCensusBanner] = show_census_banner
      @homepage_data[:donorBannerName] = donor_banner_name
      @homepage_data[:specialAnnouncement] = Announcements.get_announcement_for_page("/home")

      if show_census_banner
        teachers_school = current_user.school_info.school
        school_stats = SchoolStatsByYear.where(school_id: teachers_school.id).order(school_year: :desc).first

        @homepage_data[:censusQuestion] = school_stats.try(:has_high_school_grades?) ? "how_many_20_hours" : "how_many_10_hours"
        @homepage_data[:currentSchoolYear] = current_census_year
        @homepage_data[:ncesSchoolId] = teachers_school.id
        @homepage_data[:teacherName] = current_user.name
        @homepage_data[:teacherId] = current_user.id
        @homepage_data[:teacherEmail] = current_user.email
      elsif donor_banner_name
        @homepage_data[:teacherId] = current_user.id
      end
    else
      @homepage_data[:isTeacher] = false
      @homepage_data[:sections] = student_sections
      @homepage_data[:studentId] = current_user.id
    end

    if current_user.school_donor_name
      donor_footer_options = {}
      donor_footer_options[:donorName] = current_user.school_donor_name
      donor_footer_options[:logos] = Dir.glob("app/assets/images/donor_logos/#{current_user.school_donor_name}/*").sort

      @homepage_data[:donorFooterOptions] = donor_footer_options
    end
  end
end
