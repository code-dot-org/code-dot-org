require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    questions, version = Foorm::Form.get_questions_and_latest_version_for_name(form1.name)
    assert_equal JSON.parse(form2.questions), questions
    assert_equal form2.version, version
  end

  test 'readable_questions formats matrix questions as expected for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'How much do you agree or disagree with the following statements about the workshop overall? >> I feel more prepared to teach the material covered in this workshop than before I came.',
      readable_questions[:general]['overall_success-more_prepared']
  end

  test 'readable_questions formats matrix questions as expected for facilitator-specific workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'During my workshop, my facilitator did the following: >> Demonstrated knowledge of the curriculum.',
      readable_questions[:facilitator]['facilitator_effectiveness-demonstrated_knowledge']
  end

  test 'readable_questions formats comment questions as expected for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'What supported your learning the most today and why?',
      readable_questions[:general]['supported']
  end

  test 'readable_questions formats comment questions as expected for facilitator workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'What were two things my facilitator did well?',
      readable_questions[:facilitator]['k5_facilitator_did_well']
  end

  test 'readable_questions formats single select questions as expected for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications.',
      readable_questions[:general]['permission']
  end
end
