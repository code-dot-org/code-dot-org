require 'aws-sdk-s3'
require 'cdo/aws/s3'

class Api::V1::MlModelsController < Api::V1::JsonApiController
  skip_before_action :verify_authenticity_token

  S3_BUCKET = 'cdo-v3-trained-ml-models'

  # POST api/v1/ml_models/save
  # Save a trained ML model to S3 and a reference to it in the database.
  def save
    model_id = generate_id
    metadata = params["ml_model"].except(:trainedModel, :featureNumberKey)
    @user_ml_model = UserMlModel.create!(
      user_id: current_user&.id,
      model_id: model_id,
      name: params["ml_model"]["name"],
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

  # GET api/v1/ml_models/names
  # Retrieve the names and ids of a user's trained ML models.
  def names
    user_ml_model_data = UserMlModel.where(user_id: current_user&.id).map {|user_ml_model| {"id": user_ml_model.model_id, "name": user_ml_model.name}}
    render json: user_ml_model_data.to_json
  end

  # GET api/v1/ml_models/:id/metadata
  # Retrieve a trained ML model's metadata
  def metadata
    metadata = UserMlModel.where(user_id: current_user&.id, model_id: params[:id])&.first&.metadata
    return render_404 unless metadata
    render json: JSON.parse(metadata)
  end

  # GET api/v1/ml_models/:id
  # Retrieve a trained ML model from S3
  def show
    model = download_from_s3(params[:id])
    return render_404 unless model
    render json: model
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
    render json: {id: @user_ml_model.id, status: status}
    head :no_content
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

  def delete_from_s3(model_id)
    AWS::S3.delete_from_bucket(S3_BUCKET, model_id)
  end
end
