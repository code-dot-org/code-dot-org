require 'aws-sdk-s3'
require 'cdo/aws/s3'

class Api::V1::MlModelsController < ApplicationController
  skip_before_action :verify_authenticity_token

  # POST api/v1//ml_models/save
  # Save a trained ML model to S3
  def save
    model_id = generate_id
    upload_to_s3(model_id, params["trainedModel"].to_json)
    render json: "hooray!"
  end

  private

  def generate_id
    SecureRandom.alphanumeric(12)
  end

  def upload_to_s3(model_id, trained_model)
    AWS::S3.upload_to_bucket('cdo-v3-trained-ml-models', model_id, trained_model, no_random: true)
  end
end
