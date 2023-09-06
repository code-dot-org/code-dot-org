require 'aws-sdk-s3'
require 'cdo/aws/s3'
require 'cdo/share_filtering'
require 'cdo/firehose'

class Api::V1::MlModelsController < Api::V1::JSONApiController
  skip_before_action :verify_authenticity_token

  S3_BUCKET = 'cdo-v3-trained-ml-models'

  # Remove certain words that we don't want to be inspected by the
  # profanity filter.
  PROFANITY_FILTER_REPLACE_TEXT_LIST = {
    sex: ''
  }

  # POST api/v1/ml_models/save
  # Save a trained ML model to S3 and a reference to it in the database.
  def save
    model_id = UserMlModel.generate_id
    model_data = params["ml_model"]
    return head :bad_request if model_data.nil? || model_data == ""

    # If there's a PII/profanity API error, we rescue the exception and the save
    # will succeed. The saved model will bypass the PII/profanity filters.
    begin
      profanity_or_pii = ShareFiltering.find_failure(
        model_data.except(:trainedModel).to_s,
        request.locale,
        PROFANITY_FILTER_REPLACE_TEXT_LIST
      )
    rescue OpenURI::HTTPError => exception
      share_filtering_error = exception
    end
    if share_filtering_error
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'ai-ml',
          study_group: 'pii-profanity-api',
          event: 'share_filtering_error',
          user_id: current_user&.id,
          data_json: model_data.except(:trainedModel).to_json
        }
      )
    end
    if profanity_or_pii
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'ai-ml',
          study_group: 'pii-profanity-api',
          event: 'profanity_or_pii',
          user_id: current_user&.id,
          data_json: model_data.except(:trainedModel).to_json,
          profanity_or_pii_json: profanity_or_pii&.to_json
        }
      )
      render json: {id: model_id, status: "piiProfanity", data: profanity_or_pii}
    else
      metadata = model_data.except(:trainedModel, :featureNumberKey)
      @user_ml_model = UserMlModel.create(
        user_id: current_user&.id,
        model_id: model_id,
        name: model_data["name"],
        metadata: metadata.to_json
      )
      if @user_ml_model.persisted?
        s3_filename = upload_to_s3(model_id, params["ml_model"].to_json)
        status = s3_filename ? "success" : "failure"
        render json: {id: model_id, status: status}
      else
        render json: {id: model_id, status: "failure"}
      end
    end
  end

  # GET api/v1/ml_models/names
  # Retrieve the names, ids and metadata of a user's trained ML models.
  def names
    user_ml_model_data = UserMlModel.where(user_id: current_user&.id).
                         map {|user_ml_model| {id: user_ml_model.model_id, name: user_ml_model.name, metadata: JSON.parse(user_ml_model.metadata)}}
    render json: user_ml_model_data.to_json
  end

  # GET api/v1/ml_models/:id
  # Retrieve a trained ML model from S3
  def show
    valid_model_id = UserMlModel.valid_model_id?(params[:id])
    # Before attempting to fetch a model from s3, check that the id param
    # matches the expected format. If the id is invalid, log it to investigate.
    if valid_model_id
      model = download_from_s3(params[:id])
      return head :not_found unless model
      render json: model
    else
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'ai-ml',
          study_group: 'show-model',
          event: 'invalid_model_id',
          user_id: current_user&.id,
          data_json: params[:id]
        }
      )
      return head :not_found
    end
  end

  # DELETE api/v1/ml_models/:id
  def destroy
    @user_ml_model = UserMlModel.find_by(model_id: params[:id])
    return head :not_found unless @user_ml_model
    return head :forbidden unless @user_ml_model.user_id == current_user.id
    @user_ml_model.destroy
    deleted_from_s3 = delete_from_s3(@user_ml_model.model_id)
    status =
      @user_ml_model.destroyed? && deleted_from_s3 ? "success" : "failure"
    render json: {id: @user_ml_model.model_id, status: status}
  end

  private def upload_to_s3(model_id, trained_model)
    AWS::S3.upload_to_bucket(S3_BUCKET, model_id, trained_model, no_random: true)
  end

  private def download_from_s3(model_id)
    AWS::S3.download_from_bucket(S3_BUCKET, model_id)
  end

  private def delete_from_s3(model_id)
    AWS::S3.delete_from_bucket(S3_BUCKET, model_id)
  end
end
