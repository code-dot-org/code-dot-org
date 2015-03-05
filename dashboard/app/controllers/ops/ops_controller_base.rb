module Ops
  class OpsControllerBase < ::ApplicationController
    respond_to :html, :xml, :json
    check_authorization
    skip_before_filter :verify_authenticity_token

    rescue_from ActiveRecord::RecordInvalid do |e|
      render text: e.to_s, status: :unprocessable_entity
    end

    rescue_from ActiveRecord::RecordNotFound do |e|
      render text: e.to_s, status: :not_found
    end

  end
end
