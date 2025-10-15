class DoctorOneDancePartyImageJob < ApplicationJob
  queue_as :images
  retry_on StandardError, attempts: 5, wait: :exponentially_longer

  # meta_key: relative key to *-metadata.json under namespace
  def perform(meta_key, opts = {})
    bucket     = opts[:bucket]
    namespace  = opts[:namespace]
    regen_ns   = opts[:regen_namespace]
    threshold  = opts[:transparency_threshold] || 0.90
    regenerate = !!opts[:regenerate]
    force_cols = !!opts[:force_recompute_colors]
    normalize  = opts.key?(:normalize_grays) ? !!opts[:normalize_grays] : true

    storage    = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)
    meta       = storage.read_json(meta_key)
    png_key    = DancePartyImageGenerator::Storage::S3Storage::Storage.png_for(meta_key, meta)

    # Make sure the image exists
    full_png   = storage.full_key(png_key)
    unless AWS::S3.exists_in_bucket(bucket, full_png)
      Rails.logger.warn("[DPIG][Doctor] Missing image for #{meta_key} -> #{png_key}")
      return
    end

    # Load bytes for analysis
    png_bytes = AWS::S3.download_from_bucket(bucket, full_png)

    # Transparency check
    if DancePartyImageGenerator::PaletteExtractor.too_transparent?(png_bytes, threshold: threshold)
      Rails.logger.warn("[DPIG][Doctor] Too transparent #{png_key} (>= #{(threshold*100).round}% alpha=0)")
      if regenerate
        # Decide where to write regenerated assets
        dest_ns   = regen_ns.presence || namespace
        dest_store = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: dest_ns)

        prompt = meta["prompt_used"] ||
          DancePartyImageGenerator::PromptBuilder.new.build(
            adj: meta["adjective"], animal: meta["animal"], attire: meta["attire"]
          )

        client = OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY", nil))
        b64 = client.images.generate(
          parameters: {model: "gpt-image-1", prompt: prompt, size: "1024x1024", n: 1, background: "transparent"}
        ).dig("data", 0, "b64_json")

        # Save regenerated
        dest_store.write_png_base64(png_key, b64, width: 1024, height: 1024)
        png_bytes = AWS::S3.download_from_bucket(bucket, dest_store.full_key(png_key))
        body, sec, ter = DancePartyImageGenerator::PaletteExtractor.extract_png_bytes(png_bytes, normalize_grays: normalize)

        new_meta = meta.merge(
          "file_name"          => File.basename(png_key),
          "body_color"         => body,
          "secondary_color"    => sec,
          "tertiary_color"     => ter,
          "regenerated"        => true,
          "regen_reason"       => "too_transparent",
          "regen_output_ns"    => dest_ns
        )
        dest_store.write_json(meta_key, DancePartyImageGenerator::Metadata::Record.dump(new_meta))
      end
      return
    end

    # Palette refresh: recompute or fill missing
    need_cols = force_cols ||
      meta["body_color"].to_s.blank? ||
      meta["secondary_color"].to_s.blank? ||
      meta["tertiary_color"].to_s.blank?

    if need_cols
      body, sec, ter = DancePartyImageGenerator::PaletteExtractor.extract_png_bytes(png_bytes, normalize_grays: normalize)
      changed = (meta["body_color"] != body) || (meta["secondary_color"] != sec) || (meta["tertiary_color"] != ter)
      if changed
        meta["body_color"] = body
        meta["secondary_color"] = sec
        meta["tertiary_color"] = ter
        storage.write_json(meta_key, DancePartyImageGenerator::Metadata::Record.dump(meta))
      end
    end
  end
end
