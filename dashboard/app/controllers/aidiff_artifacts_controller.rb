class AidiffArtifactsController <ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def index
    render json: @aidiff_artifacts&.map(&:summarize)
  end
end
