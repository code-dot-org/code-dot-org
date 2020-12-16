require 'aws-sdk-s3'
require 'cdo/aws/s3'

class Api::V1::MlModelsController < ApplicationController
  skip_before_action :verify_authenticity_token
  S3_BUCKET = 'cdo-v3-trained-ml-models'

  # POST api/v1/ml_models/save
  # Save a trained ML model to S3
  def save
    model_id = generate_id
    upload_to_s3(model_id, params["ml_model"].to_json)
    render json: {id: model_id}
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
