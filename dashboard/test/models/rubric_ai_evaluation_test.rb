require 'test_helper'

class RubricAiEvaluationTest < ActiveSupport::TestCase
  test 'failed? returns true when the status reflects a PII failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION]
    assert rubric.failed?
  end

  test 'failed? returns true when the status reflects a profanity failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION]
    assert rubric.failed?
  end

  test 'failed? returns true when the status reflects a normal failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE]
    assert rubric.failed?
  end

  test 'failed? returns false when the status reflects a success' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS]
    refute rubric.failed?
  end

  test 'succeeded? returns true when the status reflects a success' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:SUCCESS]
    assert rubric.succeeded?
  end

  test 'succeeded? returns false when the status reflects a failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:FAILURE]
    refute rubric.succeeded?
  end

  test 'queued? returns true when the status reflects the job has been queued' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:QUEUED]
    assert rubric.queued?
  end

  test 'running? returns true when the status reflects the job is running' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:RUNNING]
    assert rubric.running?
  end

  test 'pii_failure? returns true when the status reflects a PII failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION]
    assert rubric.pii_failure?
  end

  test 'profanity_failure? returns true when the status reflects a profanity failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION]
    assert rubric.profanity_failure?
  end

  test 'share_filtering_failure? returns true when the status reflects a PII failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PII_VIOLATION]
    assert rubric.share_filtering_failure?
  end

  test 'share_filtering_failure? returns true when the status reflects a profanity failure' do
    rubric = create :rubric_ai_evaluation, status: SharedConstants::RUBRIC_AI_EVALUATION_STATUS[:PROFANITY_VIOLATION]
    assert rubric.share_filtering_failure?
  end
end
