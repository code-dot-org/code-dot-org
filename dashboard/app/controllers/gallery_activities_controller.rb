class GalleryActivitiesController < ApplicationController
  before_action :authenticate_user!, except: :index
  load_and_authorize_resource
  check_authorization

  before_action :set_gallery_activity, only: [:destroy]

  protect_from_forgery except: [:create]

  INDEX_PER_PAGE = 30
  MAX_PAGE = 100

  def index
    page = params[:page].to_i rescue 0
    if page < 0 || page > MAX_PAGE
      redirect_to gallery_activities_path
      return
    end

    if params[:app]
      @gallery_activities = gallery_activities_for_app params[:app]
    else
      # if app is not specified, show both apps
      @playlab_gallery_activities = gallery_activities_for_app Game::PLAYLAB
      @artist_gallery_activities = gallery_activities_for_app Game::ARTIST
    end

    gallery_feature_ship_date = Date.new(2014, 4, 9)
    @days = (Date.today - gallery_feature_ship_date).to_i
  end

  # POST /gallery
  # POST /gallery.json
  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      @gallery_activity = GalleryActivity.where(gallery_activity_params).
        first_or_initialize
      @gallery_activity.autosaved = false
      authorize! :save_to_gallery, @gallery_activity.user_level

      if @gallery_activity.save
        return head :created
      else
        # Right now this never happens because we end up raising an exception in
        # one of the authorization checks.
        render json: @gallery_activity.errors, status: :unprocessable_entity
      end
    end
  end

  # DELETE /gallery/1
  # DELETE /gallery/1.json
  def destroy
    @gallery_activity.destroy
    head :no_content
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_gallery_activity
    @gallery_activity = GalleryActivity.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list
  # through.
  def gallery_activity_params
    if params[:gallery_activity] && current_user
      params[:gallery_activity][:user_id] ||= current_user.id
    end
    params.require(:gallery_activity).
      permit(:level_source_id, :user_id, :user_level_id).
      tap {|param| param.require(:user_level_id)}
  end

  def gallery_activities_for_app(app)
    # When we show both apps, show half as many per app.
    per_page = params[:app] ? INDEX_PER_PAGE : INDEX_PER_PAGE / 2
    GalleryActivity.
      where(autosaved: false, app: app).
      order(id: :desc).
      page(params[:page]).
      per(per_page)
  end
end
