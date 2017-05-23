class HomeController < ApplicationController
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

  def index
    if request.cookies['pm'] == 'new_header'
      redirect_to '/courses'
    else
      init_homepage
    end
  end

  # Show /home for teachers.
  # Legacy header: redirect to studio.code.org
  # Signed out: redirect to code.org
  # Signed in student: redirect to studio.code.org/courses
  # Signed in teacher: render this page
  def home
    if request.cookies['pm'] != 'new_header'
      redirect_to '/'
    else
      cookie_key = '_user_type' + (Rails.env.production? ? '' : "_#{Rails.env}")

      if !current_user
        redirect_to CDO.code_org_url
      elsif request.cookies[cookie_key] == "student"
        redirect_to '/courses'
      else
        init_homepage
        render 'home/index'
      end
    end
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
    if current_user
      @gallery_activities =
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
      @force_race_interstitial = params[:forceRaceInterstitial]
      @force_school_info_interstitial = params[:forceSchoolInfoInterstitial]
      @recent_courses = current_user.recent_courses.slice(0, 2)

      if current_user.teacher?
        base_url = CDO.code_org_url('/teacher-dashboard#/sections/')
        @sections = current_user.sections.map do |section|
          if section.script_id
            course_name = Script.get_from_cache(section.script_id)[:name]
            course = data_t_suffix('script.name', course_name, 'title')
            link_to_course = script_url(section.script_id)
          else
            course = ""
            link_to_course = base_url
          end
          {
            id: section.id,
            name: section.name,
            linkToProgress: "#{base_url}#{section.id}/progress",
            course: course,
            linkToCourse: link_to_course,
            numberOfStudents: section.students.length,
            linkToStudents: "#{base_url}#{section.id}/manage",
            sectionCode: section.code
          }
        end
      end
    end
  end
end
