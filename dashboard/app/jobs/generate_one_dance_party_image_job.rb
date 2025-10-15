class GenerateOneDancePartyImageJob < ApplicationJob
  queue_as :images
  retry_on StandardError, attempts: 5, wait: :exponentially_longer

  # item: { adj:, animal:, attire:, variant: }
  # dest: :animal | :animal_attire | :adj_animal_attire
  # opts: { bucket:, namespace: }
  def perform(item, dest, opts = {})
    bucket    = opts.symbolize_keys[:bucket]    || DancePartyImageGenerator::Settings.bucket
    namespace = opts.symbolize_keys[:namespace] || DancePartyImageGenerator::Settings.namespace

    storage = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)
    prompt  = DancePartyImageGenerator::PromptBuilder.new(width: 1024, height: 1024)

    # Plan → base name and keys
    base     = DancePartyImageGenerator::Naming.base_name(item.symbolize_keys) # e.g., "emo-frog-headband-00"
    png_rel  = DancePartyImageGenerator::Storage::S3Storage::Storage.path_for(dest: dest.to_sym, base: base, ext: ".png")
    json_rel = DancePartyImageGenerator::Storage::S3Storage::Storage.path_for(dest: dest.to_sym, base: base, ext: "-metadata.json")

    # Idempotency: skip if both already exist
    if AWS::S3.exists_in_bucket(bucket, storage.full_key(png_rel)) &&
        AWS::S3.exists_in_bucket(bucket, storage.full_key(json_rel))
      Rails.logger.info("[DPIG] Skip existing #{base}")
      return
    end

    # Generate one via the service (reusing your adapter + robust palette)
    gen = DancePartyImageGenerator::ImageGenerator.new(
      openai: OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY", nil)),
      storage: storage,
      prompt_builder: prompt,
      palette_extractor: DancePartyImageGenerator::PaletteExtractor.new,
      logger: Rails.logger,
      width: 1024, height: 1024, model: "gpt-image-1", background: "transparent"
    )

    gen.call(plan: [item.symbolize_keys], dest: dest.to_sym)
  end
end
