class AichatController < ApplicationController
  authorize_resource class: false

  # GET /aichat/user_has_access
  def user_has_access
    render(status: :ok, json: {userHasAccess: current_user&.has_aichat_access?})
  end

  # POST /aichat/find_toxicity
  # Finds toxicity in the given system prompt and retrieval contexts and returns a list of flagged fields.
  def find_toxicity
    level_id = params[:levelId]
    flagged_fields = []

    if params[:systemPrompt].present?
      toxicity = AichatSafetyHelper.find_toxicity(params[:systemPrompt], level_id)
      flagged_fields << {field: 'systemPrompt', toxicity: toxicity} if toxicity.present?
    end

    if params[:retrievalContexts].present?
      retrieval_joined = params[:retrievalContexts].join(' ')
      toxicity = AichatSafetyHelper.find_toxicity(retrieval_joined, level_id)
      flagged_fields << {field: 'retrievalContexts', toxicity: toxicity} if toxicity.present?
    end

    render json: {flagged_fields: flagged_fields}.deep_transform_keys {|key| key.to_s.camelize(:lower)}
  end
end
