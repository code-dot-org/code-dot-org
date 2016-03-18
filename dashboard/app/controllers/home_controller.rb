class HomeController < ApplicationController
  before_filter :authenticate_user!, only: :gallery_activities

  # Don't require an authenticity token on set_locale because we post to that
  # action from publicly cached page without a valid token. The worst case impact
  # is that an attacker could change a user's language if they fooled them into
  # clicking on a link.
  skip_before_action :verify_authenticity_token, :only => 'set_locale'

  def set_locale
    set_locale_cookie(params[:locale]) if params[:locale]
    if params[:i18npath]
      redirect_to "/#{params[:i18npath]}"
    elsif params[:return_to]
      redirect_to params[:return_to].to_s
    else
      redirect_to '/'
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

  def certificate_link_test
    render 'certificate_link_test', formats: [:html]
  end
end
