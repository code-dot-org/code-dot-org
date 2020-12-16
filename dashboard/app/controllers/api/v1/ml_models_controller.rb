require 'aws-sdk-s3'
require 'cdo/aws/s3'

class Api::V1::MlModelsController < Api::V1::JsonApiController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!

  S3_BUCKET = 'cdo-v3-trained-ml-models'

  # POST api/v1/ml_models/save
  # Save a trained ML model to S3 and a reference to it in the database.
  def save
    model_id = generate_id
    UserMlModel.create!(
      user_id: current_user.id,
      model_id: model_id,
      name: params["ml_model"]["name"]
    )
    upload_to_s3(model_id, params["ml_model"].to_json)

    render json: "hooray!"
  end

  # GET api/v1/ml_models/names
  # Retrieve the names and ids of a user's trained ML models.
  def user_ml_model_names
    user_ml_model_data = UserMlModel.where(user_id: current_user.id).map {|user_ml_model| {"id": user_ml_model.model_id, "name": user_ml_model.name}}
    render json: user_ml_model_data.to_json
  end

  # GET api/v1/ml_models/:model_id
  # Retrieve a trained ML model from S3
  def get_trained_model
    model = download_from_s3(params[:model_id])
    render json: model
  end

  private

  def generate_id
    SecureRandom.alphanumeric(12)
  end

  def upload_to_s3(model_id, trained_model)
    AWS::S3.upload_to_bucket(S3_BUCKET, model_id, trained_model, no_random: true)
  end

  def download_from_s3(model_id)
    AWS::S3.download_from_bucket(S3_BUCKET, model_id)
  end
end
