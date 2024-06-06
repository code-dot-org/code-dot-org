require 'test_helper'

class TestAiProxyControllerTest < ActionController::TestCase
  test 'assessment: returns convincing evidence for all key concepts' do
    rubric = <<~CSV
      Key Concept,Label
      Concept 1,
      Concept 2,
      Concept 3,
    CSV

    post :assessment, params: {rubric: rubric}
    assert_response :success

    response_data = JSON.parse(@response.body)['data']
    assert_equal 3, response_data.count
    assert_equal 'Convincing Evidence', response_data[0]['Label']
    assert_equal 'Convincing Evidence', response_data[1]['Label']
    assert_equal 'Convincing Evidence', response_data[2]['Label']
  end
end
