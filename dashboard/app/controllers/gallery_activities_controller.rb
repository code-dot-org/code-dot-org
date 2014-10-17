class GalleryActivitiesController < ApplicationController
  before_filter :authenticate_user!, except: :index
  load_and_authorize_resource 
  check_authorization

  before_action :set_gallery_activity, only: [:destroy]

  INDEX_PER_PAGE = 30
  def index
    def gallery_activities_for_app(app)
      per_page = params[:app] ? INDEX_PER_PAGE : INDEX_PER_PAGE / 2 # when we show both apps, show half as many per app
      GalleryActivity.where(autosaved: false, app: app).order(id: :desc).page(params[:page]).per(per_page)
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

  # POST /gallery_activities
  # POST /gallery_activities.json
  def create
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      @gallery_activity = GalleryActivity.where(gallery_activity_params).first_or_initialize
      @gallery_activity.autosaved = false
      authorize! :save_to_gallery, @gallery_activity.activity

      respond_to do |format|
        if @gallery_activity.save
          format.json { render action: 'show', status: :created, location: @gallery_activity }
        else
          # right now this never happens because we end up raising an exception in one of the authorization checks
          format.json { render json: @gallery_activity.errors, status: :unprocessable_entity }
        end
      end
    end
  end

  # DELETE /gallery_activities/1
  # DELETE /gallery_activities/1.json
  def destroy
    @gallery_activity.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_gallery_activity
      @gallery_activity = GalleryActivity.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def gallery_activity_params
      params[:gallery_activity][:user_id] ||= current_user.id if params[:gallery_activity] && current_user
      params.require(:gallery_activity).permit(:activity_id, :user_id)
    end
end
