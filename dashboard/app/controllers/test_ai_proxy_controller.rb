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
    rubric_rows = CSV.parse(params[:rubric], headers: true).map(&:to_h)
    key_concepts = rubric_rows.map {|row| row['Key Concept']}
    response_data = key_concepts.map do |key_concept|
      {
        'Key Concept' => key_concept,
        'Grade' => 'Convincing Evidence'
      }
    end
    render json: {data: response_data}
  end
end
