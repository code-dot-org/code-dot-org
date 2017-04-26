require 'cdo/firehose'

class Api::V1::UsersController < ApplicationController
  before_action :load_user

  def load_user
    user_id = params[:user_id]
    if user_id != 'me' && user_id != current_user.id
      raise CanCan::AccessDenied
    end
    @user = current_user
  end

  # GET /api/v1/users/<user_id>/using_text_mode
  def get_using_text_mode
    render json: {using_text_mode: !!@user.using_text_mode}
  end

  # POST /api/v1/users/<user_id>/using_text_mode
  def post_using_text_mode
    @user.using_text_mode = !!params[:using_text_mode].try(:to_bool)
    @user.save

    FirehoseClient.instance.put_record(
      'analysis-events',
      {
        study: 'project_block_and_text_switching',
        event: @user.using_text_mode ? 'block_to_text' : 'text_to_block',
        project_id: params[:project_id],
        user_id: @user.id,
        level_id: params[:level_id],
      }
    )

    render json: {using_text_mode: !!@user.using_text_mode}
  end
end
