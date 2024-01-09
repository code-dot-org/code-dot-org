# Provides a stub for the AI proxy API, for testing purposes. Routes here
# should match the routes defined in https://github.com/code-dot-org/aiproxy
class TestAiProxyController < ApplicationController
  layout false

  # CSRF token is not available to the requester, because this API is called
  # from an Active Job and not from the browser.
  skip_before_action :verify_authenticity_token

  # POST /api/test/ai_proxy/assessment
  #
  # Provides a fake assessment where every key concept is given a score of
  # Convincing Evidence.
  def assessment
    rubric_rows = CSV.parse(params[:rubric], headers: true).map(&:to_h)
    key_concepts = rubric_rows.map {|row| row['Key Concept']}
    response_data = key_concepts.map do |key_concept|
      {
        'Key Concept' => key_concept,
        'Label' => 'Convincing Evidence'
      }
    end
    render json: {data: response_data}
  end
end
