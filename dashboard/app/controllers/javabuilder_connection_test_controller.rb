require 'cdo/firehose'

class JavabuilderConnectionTestController < ApplicationController
  # POST /javabuilder/connectivity_test_logging
  def log
    unless user_signed_in?
      return head :forbidden
    end

    data = {user_type: current_user.user_type}
    if params[:detail]
      data[:detail] = params[:detail]
    end

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'java-builder-connectivity',
        event: params[:event],
        user_id: current_user.id,
        data_json: data.to_json
      }
    )
  end

  def get_csrf_token
    unless user_signed_in?
      return head :forbidden
    end

    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end
end
