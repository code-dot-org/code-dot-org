class HomeController < ApplicationController
  before_filter :authenticate_user!, only: :gallery_activities

  def set_locale
    set_locale_cookie(params[:locale]) if params[:locale]
    redirect_to params[:return_to].to_s
  end

  def check_username
    if !params[:username] || params[:username].length < 5
      render json: { message: I18n.t('signup_form.invalid_username'), available: false }
    else
      if User.exists?(username: params[:username])
        render json: { message: I18n.t('signup_form.taken_username'), available: false }
      else
        render json: { message: I18n.t('signup_form.valid_username'), available: true }
      end
    end
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
    if current_user
      @gallery_activities = 
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
    end
  end

  def gallery_activities
    if current_user
      @gallery_activities = 
        current_user.gallery_activities.order(id: :desc).page(params[:page]).per(GALLERY_PER_PAGE)
    end
    render partial: 'home/gallery_content'
  end
end
