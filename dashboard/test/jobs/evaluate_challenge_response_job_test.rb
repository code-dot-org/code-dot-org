require 'test_helper'

class EvaluateChallengeResponseJobTest < ActiveJob::TestCase
  let(:challenge) {create(:challenge, :with_rubric)}
  let(:challenge_response) do
    create(:challenge_response, challenge:, student_text: 'It equals 4', is_final: true)
  end

  EVALUATION = {
    'level' => 2,
    'reasoning' => 'correct',
    'evidence' => 'It equals 4',
    'student_feedback' => 'You explained your idea clearly. Next time, try showing your steps.',
  }.freeze

  def stub_openai(code: 200, content: EVALUATION.to_json)
    response = mock('response')
    response.stubs(:code).returns(code)
    response.stubs(:body).returns('')
    response.stubs(:parsed_response).returns(
      {'choices' => [{'message' => {'content' => content}}]}
    )
    HTTParty.stubs(:post).returns(response)
  end

  def stub_filters_pass
    ShareFiltering.stubs(:find_pii_failure).returns(nil)
    ShareFiltering.stubs(:find_profanity_failure).returns(nil)
  end

  it 'stores the parsed evaluation and marks the response evaluated' do
    stub_filters_pass
    stub_openai

    EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)

    challenge_response.reload
    _(challenge_response.evaluation_result).must_equal EVALUATION
    _(challenge_response.student_feedback).must_equal EVALUATION['student_feedback']
    _(challenge_response.evaluation_status).must_equal 'success'
    _(challenge_response.evaluated_at).wont_be_nil
  end

  it 'sets queued status on enqueue' do
    EvaluateChallengeResponseJob.perform_later(challenge_response_id: challenge_response.id)

    _(challenge_response.reload.evaluation_status).must_equal 'queued'
  end

  it 'does not re-evaluate a response that already succeeded' do
    challenge_response.update!(evaluation_status: :success, evaluation_result: EVALUATION)
    HTTParty.expects(:post).never

    EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)

    _(challenge_response.reload.evaluation_status).must_equal 'success'
  end

  it 'records pii_violation and does not call OpenAI when PII is found' do
    failure = ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'kid@example.com')
    ShareFiltering.stubs(:find_pii_failure).raises(PIIFilterException.new('PII', failure))
    HTTParty.expects(:post).never

    EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)

    _(challenge_response.reload.evaluation_status).must_equal 'pii_violation'
  end

  it 'records profanity_violation and does not call OpenAI when profanity is found' do
    failure = ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'darn')
    ShareFiltering.stubs(:find_pii_failure).returns(nil)
    ShareFiltering.stubs(:find_profanity_failure).raises(ProfanityFilterException.new('profanity', failure))
    HTTParty.expects(:post).never

    EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)

    _(challenge_response.reload.evaluation_status).must_equal 'profanity_violation'
  end

  it 'records failure and raises when OpenAI returns a non-200' do
    stub_filters_pass
    stub_openai(code: 500)

    _ do
      EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)
    end.must_raise EvaluateChallengeResponseJob::OpenaiRequestError

    _(challenge_response.reload.evaluation_status).must_equal 'failure'
  end

  it 'records failure and raises when the challenge has no rubric' do
    stub_filters_pass
    challenge.update!(rubric: nil)

    _ do
      EvaluateChallengeResponseJob.perform_now(challenge_response_id: challenge_response.id)
    end.must_raise ArgumentError

    _(challenge_response.reload.evaluation_status).must_equal 'failure'
  end
end
