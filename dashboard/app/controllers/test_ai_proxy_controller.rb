class TestAiProxyController < ApplicationController
  layout false

  skip_before_action :verify_authenticity_token

  # TODO: remove debug code
  # GET /api/test/ai_proxy/get_stub_response
  def get_stub_response
    render plain: "stub response"
  end

  # POST /api/test/ai_proxy/assessment
  def assessment
    puts "assessment: #{params.inspect}"
    head :no_content
  end
end
