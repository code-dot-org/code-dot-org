class HomeController < ApplicationController
  include UsersHelper
  before_action :authenticate_user!, only: :gallery_activities

  # Don't require an authenticity token on set_locale because we post to that
  # action from publicly cached page without a valid token. The worst case impact
  # is that an attacker could change a user's language if they fooled them into
  # clicking on a link.
  skip_before_action :verify_authenticity_token, only: 'set_locale'

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

  GALLERY_PER_PAGE = 5

  # Signed in student, with an assigned course/script: redirect to course overview page
  # Note: the student will be redirected to the course or script in which they
  # most recently made progress, which may not be an assigned course or script.
  # Signed in student or teacher, without an assigned course/script: redirect to /home
  # Signed out: redirect to /courses
  def index
    if current_user
      if current_user.student? && current_user.assigned_course_or_script? && !session['clever_link_flag'] && current_user.primary_script

        # Send students in course experiments (such as the subgoals experiment)
        # to the right place when they end up on the wrong version of their script.
        #
        # In the future, when primary_script selects the script the student is
        # assigned to rather then where they last made progress, this check can
        # be removed.
        alternate_script = current_user.primary_script.alternate_script(current_user)
        if alternate_script
          redirect_to script_path(alternate_script)
          return
        end

        redirect_to script_path(current_user.primary_script)
      else
        redirect_to '/home'
      end
    else
      clear_clever_session_variables
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

  def gallery_activities
    if current_user
      @gallery_activities =
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
    end
    render partial: 'home/gallery_content'
  end

  def certificate_link_test
    render 'certificate_link_test', formats: [:html]
  end

  # This static page combines TOS and Privacy partials all in one page
  # for easy printing.
  def terms_and_privacy
    render partial: 'home/tos_and_privacy'
  end

  # This static page contains the teacher announcements for US and non-US visitors.
  def teacher_announcements
    render template: 'api/teacher_announcement', layout: false
  end

  private

  def init_homepage
    @is_english = request.language == 'en'
    if current_user
      @gallery_activities =
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
      @force_race_interstitial = params[:forceRaceInterstitial]
      @force_school_info_interstitial = params[:forceSchoolInfoInterstitial]
      @sections = current_user.sections.map(&:summarize)
      @student_sections = current_user.sections_as_student.map(&:summarize)

      # Students and teachers will receive a @top_course for their primary
      # script, so we don't want to include that script (if it exists) in the
      # regular lists of recent scripts.
      exclude_primary_script = true
      @recent_courses = current_user.recent_courses_and_scripts(exclude_primary_script)

      script = current_user.primary_script
      if script
        script_level = current_user.next_unpassed_progression_level(script)
      end

      if script && script_level
        @top_course = {
          assignableName: data_t_suffix('script.name', script[:name], 'title'),
          lessonName: script_level.stage.localized_title,
          linkToOverview: script_path(script),
          linkToLesson: script_next_path(script, 'next')
        }
      end
    end
  end
end
