require 'test_helper'

class ChallengeEvaluationPromptHelperTest < ActiveSupport::TestCase
  let(:challenge) {create(:challenge, :with_rubric)}
  let(:challenge_response) do
    create(:challenge_response, challenge:, student_text: 'It equals 4', transcript: 'I counted on my fingers')
  end

  # 1x1 transparent PNG.
  PNG_BYTES = Base64.decode64(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  ).freeze

  describe '.system_prompt' do
    it 'includes the challenge question and every rubric level' do
      prompt = ChallengeEvaluationPromptHelper.system_prompt(challenge)

      _(prompt).must_include challenge.question
      _(prompt).must_include 'Level 0: No answer is present'
      _(prompt).must_include 'Level 2: Answer is correct'
      _(prompt).must_include 'Level 3: Answer is correct and the reasoning is clearly explained'
    end

    it 'instructs the model to write score-free feedback for the student' do
      prompt = ChallengeEvaluationPromptHelper.system_prompt(challenge)

      _(prompt).must_include 'addressed directly to the student'
      _(prompt).must_include 'never mention scores, levels, grades, or the rubric'
    end
  end

  describe '.user_content' do
    it 'includes labeled text parts for student_text and transcript' do
      content = ChallengeEvaluationPromptHelper.user_content(challenge_response)

      texts = content.select {|part| part[:type] == 'text'}.pluck(:text)
      _(texts.length).must_equal 2
      _(texts.first).must_include 'It equals 4'
      _(texts.last).must_include 'I counted on my fingers'
    end

    it 'omits blank text parts' do
      challenge_response.update!(student_text: nil, transcript: nil)

      _(ChallengeEvaluationPromptHelper.user_content(challenge_response)).must_be_empty
    end

    it 'embeds uploaded whiteboard images as base64 data URIs' do
      create(:challenge_response_asset, challenge_response:)
      ChallengeResponseAsset.any_instance.stubs(:uploaded?).returns(true)
      ChallengeResponseAsset.any_instance.stubs(:download_bytes).returns(PNG_BYTES)

      content = ChallengeEvaluationPromptHelper.user_content(challenge_response)

      images = content.select {|part| part[:type] == 'image_url'}
      _(images.length).must_equal 1
      _(images.first[:image_url][:url]).must_equal(
        "data:image/png;base64,#{Base64.strict_encode64(PNG_BYTES)}"
      )
    end

    it 'skips video assets and whiteboard assets with no uploaded bytes' do
      create(:challenge_response_asset, challenge_response:, asset_type: 'video')
      create(:challenge_response_asset, challenge_response:)
      ChallengeResponseAsset.any_instance.stubs(:uploaded?).returns(false)

      content = ChallengeEvaluationPromptHelper.user_content(challenge_response)

      _(content.select {|part| part[:type] == 'image_url'}).must_be_empty
    end
  end

  describe '.response_format' do
    it 'bakes the rubric levels into the schema as an integer enum' do
      format = ChallengeEvaluationPromptHelper.response_format(challenge)

      _(format[:type]).must_equal 'json_schema'
      level_schema = format.dig(:json_schema, :schema, :properties, :level)
      _(level_schema[:type]).must_equal 'integer'
      _(level_schema[:enum]).must_equal [0, 1, 2, 3]
    end

    it 'requires the evaluation and student_feedback fields' do
      schema = ChallengeEvaluationPromptHelper.response_format(challenge).dig(:json_schema, :schema)

      _(schema[:properties]).must_include :student_feedback
      _(schema[:required]).must_equal %w[level reasoning evidence student_feedback]
    end

    it 'raises when the challenge has no rubric levels' do
      challenge.update!(rubric: nil)

      _ {ChallengeEvaluationPromptHelper.response_format(challenge)}.must_raise ArgumentError
    end
  end
end
