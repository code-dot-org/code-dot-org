require 'cdo/firehose'

class JavabuilderConnectionTestController < ApplicationController
  before_action :authenticate_user!

  # POST /javabuilder/connectivity_test_logging
  def log
    data = {user_type: current_user.user_type}
    if params[:error]
      data[:error] = params[:error]
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
end
