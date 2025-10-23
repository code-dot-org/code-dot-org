# app/jobs/generate_one_dance_party_image_job.rb
require "openai"

class GenerateOneDancePartyImageJob < ApplicationJob
  queue_as :images
  retry_on StandardError, attempts: 5, wait: :exponentially_longer

  IMG_W = 1024
  IMG_H = 1024
  MODEL = "gpt-image-1"

  # item: { adj:, animal:, attire:, variant: }
  # dest: :animal | :animal_attire | :adj_animal_attire
  # opts: { bucket:, namespace: }
  def perform(item, dest, opts = {})
    item      = item.symbolize_keys
    dest      = dest.to_sym
    bucket    = opts.symbolize_keys[:bucket]    || DancePartyImageGenerator::Settings.bucket
    namespace = opts.symbolize_keys[:namespace] || DancePartyImageGenerator::Settings.namespace

    key = CDO.openai_student_learning_api_key.presence || ENV.fetch("OPENAI_API_KEY", nil)
    raise "Missing OpenAI API key (set openai_student_learning_api_key or OPENAI_API_KEY)" if key.blank?

    storage = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)
    prompt  = DancePartyImageGenerator::PromptBuilder.new(width: IMG_W, height: IMG_H)

    base     = DancePartyImageGenerator::Naming.base_name(item) # e.g., "emo-frog-headband-00"
    png_rel  = DancePartyImageGenerator::Storage::S3Storage::Storage.path_for(dest: dest, base: base, ext: ".png")
    json_rel = DancePartyImageGenerator::Storage::S3Storage::Storage.path_for(dest: dest, base: base, ext: "-metadata.json")

    # Idempotency: skip if both already exist
    if AWS::S3.exists_in_bucket(bucket, storage.full_key(png_rel)) &&
        AWS::S3.exists_in_bucket(bucket, storage.full_key(json_rel))
      Rails.logger.info("[DPIG] Skip existing #{base}")
      return
    end

    gen = DancePartyImageGenerator::ImageGenerator.new(
      openai: OpenAI::Client.new(access_token: key),                 # ← keyword arg
      storage: storage,
      prompt_builder: prompt,
      palette_extractor: DancePartyImageGenerator::PaletteExtractor.new,
      logger: Rails.logger,
      width: IMG_W, height: IMG_H, model: MODEL, background: "transparent"
    )

    gen.call(plan: [item], dest: dest)
  rescue => exception
    Rails.logger.error("[DPIG] GenerateOneDancePartyImageJob failed for #{base || item.inspect}: #{exception.class}: #{exception.message}")
    raise
  end
end
