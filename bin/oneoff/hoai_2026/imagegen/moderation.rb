# The safety checks a pre-generated image gets in place of the lab's: the
# lab runs none on a cached image (imageCache.ts), so these are the only
# ones it ever has. They mirror the live path (imageSafety.ts):
#
#   azure   Azure AI Content Safety on every frame, always.
#   judge   aichat's LLM judges, on every frame and once per prompt; the lab
#           puts both behind one kill switch, and so does --judge.
#
# Every check fails closed: a service error is a verdict of its own, and
# nothing that lacks a passing verdict is published.

require 'base64'
require 'httparty'
require 'json'
require 'stringio'

require 'cdo/image_moderation'

require_relative 'constants'

class Moderator
  def initialize(api_key)
    @api_key = api_key
  end

  # The judges' instructions, as the lab words them (safetyPrompts.ts).
  def safety_prompts
    @safety_prompts ||= JSON.parse(run_dumper('--safety'))
  end

  # Azure's per-category severities against AZURE_BLOCKED_SEVERITY, as
  # getImageModerationVerdict() in util/moderateImage.ts reads them.
  def azure(png)
    result = ImageModeration.moderate_image(StringIO.new(png), 'image/png')
    return {'verdict' => 'error', 'reason' => 'no response from Azure'} if result.nil?

    categories = result['categoriesAnalysis']
    # A category the table does not name is flagged, as severity < undefined
    # is false in the lab's check.
    safe = categories.is_a?(Array) && categories.all? do |category|
      blocked = AZURE_BLOCKED_SEVERITY[category['category']]
      blocked && category['severity'].to_i < blocked
    end
    {'verdict' => safe ? 'safe' : 'flagged', 'categories' => categories}
  rescue StandardError => exception
    {'verdict' => 'error', 'reason' => exception.message}
  end

  # isImageSafe() in aichat's safetyHelpers.ts: the instructions, then the
  # picture.
  def judge_image(png)
    judge([
            {text: safety_prompts['image']},
            {inline_data: {mime_type: 'image/png', data: Base64.strict_encode64(png)}},
          ]
)
  end

  # isTextSafe() in aichat's safetyHelpers.ts, worded as it words it.
  def judge_prompt(text)
    judge([{text: "#{safety_prompts['text']}. Here is the text to classify: #{text}"}])
  end

  private def judge(parts)
    body = {
      contents: [{role: 'user', parts: parts}],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {classification: {type: 'STRING', enum: %w[OK INAPPROPRIATE]}},
          required: ['classification'],
        },
      },
    }
    attempts = 0
    begin
      attempts += 1
      response = HTTParty.post(
        format(GEMINI_URL, model: JUDGE_MODEL),
        headers: {'Content-Type' => 'application/json', 'x-goog-api-key' => @api_key},
        body: JSON.generate(body),
        timeout: 120
      )
      raise RetryableImageRequestError, "HTTP #{response.code}" if response.code == 429 || response.code >= 500
      return {'verdict' => 'error', 'reason' => "HTTP #{response.code}"} unless response.success?

      text = response.parsed_response.dig('candidates', 0, 'content', 'parts')&.filter_map {|part| part['text']}&.join
      classification = JSON.parse(text.to_s)['classification']
      # isValidAndPassingClassification(): anything else is an error.
      case classification
      when 'OK' then {'verdict' => 'ok'}
      when 'INAPPROPRIATE' then {'verdict' => 'flagged'}
      else {'verdict' => 'error', 'reason' => "classification #{classification.inspect}"}
      end
    rescue Net::ReadTimeout, Net::OpenTimeout, Errno::ECONNRESET, RetryableImageRequestError => exception
      return {'verdict' => 'error', 'reason' => exception.message} if attempts >= MAX_ATTEMPTS
      sleep(3 * attempts)
      retry
    rescue JSON::ParserError => exception
      {'verdict' => 'error', 'reason' => "unreadable judgement: #{exception.message}"}
    end
  end
end
