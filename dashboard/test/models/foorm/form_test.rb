require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    questions, version = Foorm::Form.get_questions_and_latest_version_for_name(form1.name)
    assert_equal JSON.parse(form2.questions), questions
    assert_equal form2.version, version
  end

  test 'new_headers_from_answers gets new header from answer' do
    form = create :foorm_form_summer_post_survey
    headers = {
      'could_improve' => 'What could be improved?',
      'most_enjoyed' => 'What did you enjoy most?'
    }

    answers = {
      'could_improve' => 'The food.',
      'pd_workshop_id' => 25
    }

    expected_new_headers = {'pd_workshop_id' => 'pd_workshop_id'}

    assert_equal expected_new_headers,
      form.new_headers_from_answers(headers, answers)
  end

  test 'new_headers_from_answers returns blank hash when no new headers in answer' do
    form = create :foorm_form_summer_post_survey
    headers = {
      'could_improve' => 'What could be improved?',
      'most_enjoyed' => 'What did you enjoy most?'
    }

    answers = {
      'could_improve' => 'The food.',
    }

    assert_equal Hash[],
      form.new_headers_from_answers(headers, answers)
  end
end
