require 'test_helper'

class ChallengeResponseTest < ActiveSupport::TestCase
  let(:challenge_response) {create(:challenge_response, is_final: true)}

  before do
    AWS::S3.stubs(:user_content_bucket).returns('test-user-content')
  end

  describe '#ready_for_evaluation?' do
    it 'is false for a non-final response' do
      challenge_response.update!(is_final: false)
      _(challenge_response.ready_for_evaluation?).must_equal false
    end

    it 'is true for a final response with no assets' do
      _(challenge_response.ready_for_evaluation?).must_equal true
    end

    it 'is false while an asset has no bytes in S3' do
      create(:challenge_response_asset, challenge_response:)
      AWS::S3.stubs(:exists_in_bucket).returns(false)

      _(challenge_response.ready_for_evaluation?).must_equal false
    end

    it 'is true once every asset has bytes in S3' do
      create(:challenge_response_asset, challenge_response:)
      AWS::S3.stubs(:exists_in_bucket).returns(true)

      _(challenge_response.ready_for_evaluation?).must_equal true
    end
  end

  describe '#summarize' do
    before do
      challenge_response.update!(
        student_feedback: 'feedback',
        evaluation_result: {'evaluations' => []},
        evaluation_status: :success,
        evaluated_at: Time.now
      )
    end

    it 'omits evaluation fields by default' do
      summary = challenge_response.summarize

      %i[student_feedback evaluation_result evaluation_status evaluated_at].each do |field|
        _(summary).wont_include field
      end
    end

    it 'includes evaluation fields when include_evaluation is set' do
      summary = challenge_response.summarize(include_evaluation: true)

      _(summary[:student_feedback]).must_equal 'feedback'
      _(summary[:evaluation_result]).must_equal({'evaluations' => []})
      _(summary[:evaluation_status]).must_equal 'success'
      _(summary[:evaluated_at]).wont_be_nil
    end
  end
end
