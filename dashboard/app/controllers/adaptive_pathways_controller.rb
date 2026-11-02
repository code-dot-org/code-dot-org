class AdaptivePathwaysController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env, only: :show
  before_action :require_levelbuilder_mode, only: :update
  authorize_resource class: false
  before_action :require_pathway

  rescue_from ActionDispatch::Http::Parameters::ParseError do |exception|
    render status: :unprocessable_entity, json: {errors: ["not valid JSON: #{exception.message.truncate(200)}"]}
  end

  # GET /adaptive_pathways/:id
  def show
    render json: File.read(AdaptiveContent.path(params[:id]))
  end

  # PUT /adaptive_pathways/:id
  def update
    text = request.raw_post
    problems = problems_in(text)
    return render status: :unprocessable_entity, json: {errors: problems} if problems.any?
    AdaptiveContent.write(params[:id], text)
    head :no_content
  end

  private def require_pathway
    head :not_found unless AdaptiveContent.exist?(params[:id])
  end

  private def problems_in(text)
    content = JSON.parse(text)
    return ['must be a JSON object'] unless content.is_a?(Hash)
    return ["id: #{content['id'].inspect} does not match #{params[:id].inspect}"] unless content['id'] == params[:id]
    []
  rescue JSON::ParserError => exception
    ["not valid JSON: #{exception.message.truncate(200)}"]
  end
end
