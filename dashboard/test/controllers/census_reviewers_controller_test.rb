require 'test_helper'

class CensusReviewersControllerTest < ActionController::TestCase
  setup do
    @reviewer = create :census_reviewer
    @not_reviewer = create :teacher
  end

  test 'redirected when not logged in' do
    submission = create :census_your_school2017v7
    post :create,  params: {
      census_submission_id: submission.id,
      override: 'N',
      notes: 'I looked into this.',
    }

    assert_response 302, @response.body.to_s
  end

  test 'post without permission gives 403' do
    sign_in @not_reviewer
    submission = create :census_your_school2017v7
    post :create,  params: {
      census_submission_id: submission.id,
      override: 'N',
      notes: 'I looked into this.',
    }

    assert_response 403, @response.body.to_s
  end

  test 'census inaccuracy investigation with override succeeds' do
    sign_in @reviewer
    submission = create :census_your_school2017v7
    post :create,  params: {
      census_submission_id: submission.id,
      override: 'N',
      notes: 'I looked into this.',
    }

    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_inaccuracy_investigation_id'].nil?, "census_inaccuracy_investigation_id expected in response: #{response}"
    refute response['census_override_id'].nil?, "census_override_id expected in response: #{response}"

    override = Census::CensusOverride.find(response['census_override_id'])
    investigation = Census::CensusInaccuracyInvestigation.find(response['census_inaccuracy_investigation_id'])
    assert_not_nil override
    assert_not_nil investigation

    assert_equal 'NO', override.teaches_cs
    assert_equal submission.school_year, override.school_year
    assert_equal submission.school_infos.first.school.id, override.school.id

    assert_equal 'I looked into this.', investigation.notes
    assert_equal override.id, investigation.census_override.id
    assert_equal @reviewer.id, investigation.user.id
    assert_equal submission.id, investigation.census_submission.id
  end

  test 'census inaccuracy investigation without override succeeds' do
    sign_in @reviewer
    submission = create :census_your_school2017v7
    post :create,  params: {
      census_submission_id: submission.id,
      notes: 'I looked into this.',
    }

    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_inaccuracy_investigation_id'].nil?, "census_inaccuracy_investigation_id expected in response: #{response}"
    assert_nil response['census_override_id']

    investigation = Census::CensusInaccuracyInvestigation.find(response['census_inaccuracy_investigation_id'])
    assert_not_nil investigation

    assert_equal 'I looked into this.', investigation.notes
    assert_nil investigation.census_override
    assert_equal @reviewer.id, investigation.user.id
    assert_equal submission.id, investigation.census_submission.id
  end

  test 'census inaccuracy investigation with nil override succeeds' do
    sign_in @reviewer
    submission = create :census_your_school2017v7
    post :create,  params: {
      census_submission_id: submission.id,
      override: nil,
      notes: 'I looked into this.',
    }

    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_inaccuracy_investigation_id'].nil?, "census_inaccuracy_investigation_id expected in response: #{response}"
    assert_nil response['census_override_id']

    investigation = Census::CensusInaccuracyInvestigation.find(response['census_inaccuracy_investigation_id'])
    assert_not_nil investigation

    assert_equal 'I looked into this.', investigation.notes
    assert_nil investigation.census_override
    assert_equal @reviewer.id, investigation.user.id
    assert_equal submission.id, investigation.census_submission.id
  end

  test 'census inaccuracy investigation bad submission id fails' do
    sign_in @reviewer
    post :create,  params: {
      census_submission_id: 0,
      override: 'N',
      notes: 'I looked into this.',
    }

    assert_response 400, @response.body.to_s
  end

  test 'census inaccuracy investigation bad override value fails' do
    sign_in @reviewer
    post :create,  params: {
      census_submission_id: 0,
      override: 'No Way',
      notes: 'I looked into this.',
    }

    assert_response 400, @response.body.to_s
  end

  test 'census inaccuracy investigation without notes fails' do
    sign_in @reviewer
    post :create,  params: {
      census_submission_id: 0,
      override: 'N',
    }

    assert_response 400, @response.body.to_s
  end
end
