module Ops
  class OpsControllerBase < ::ApplicationController
    respond_to :json
    check_authorization
    skip_before_filter :verify_authenticity_token

    before_action :always_respond_with_json

    rescue_from ActiveRecord::RecordInvalid do |e|
      render text: e.to_s, status: :unprocessable_entity
    end

    rescue_from ActiveRecord::RecordNotFound do |e|
      render text: e.to_s, status: :not_found
    end

    def always_respond_with_json
      request.format = :json
    end
  end
end
