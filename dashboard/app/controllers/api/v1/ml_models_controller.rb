require 'aws-sdk-s3'
require 'cdo/aws/s3'

ML_MODELS_BUCKET = 'cdo-v3-trained-ml-models'.freeze

class Api::V1::MLModelsController < Api::V1::JsonApiController
  authorize_resource

  # POST api/v1//ml_models
  # Save a trained ML model to S3
  def create
    puts
    puts
    puts "Create ML Models was called!"
    puts
    puts
    upload_to_s3(@model.id, @model.trained_model)
  end

  private

  def upload_to_s3(model_id, trained_model)
    AWS::S3.upload_to_bucket(ML_MODELS_BUCKET, model_id, trained_model, no_random: true)
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def ml_model_params
    params.require(:ml_model).permit(:user_id, :model_id, :model_name, :trained_model)
  end
end
