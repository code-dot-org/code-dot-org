class TestAiProxyController < ApplicationController
  layout false

  # CSRF token is not available to the requester, because this API is called
  # from an Active Job and not from the browser.
  skip_before_action :verify_authenticity_token

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
