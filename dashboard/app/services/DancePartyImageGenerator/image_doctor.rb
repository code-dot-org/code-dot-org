module DancePartyImageGenerator
  class ImageDoctor
    def initialize(storage:, palette_extractor:, openai: nil, logger: Rails.logger, regenerate: false, regen_mode: :inplace, regen_root: nil)
      @storage = storage
      @palette = palette_extractor
      @openai = openai
      @logger = logger
      @regenerate = regenerate
      @regen_mode = regen_mode
      @regen_root = regen_root
    end

    # folders: %w[animal animal-attire adjective-animal-attire]
    def call(folders:, transparency_threshold: 0.90)
      folders.each do |folder|
        @storage.list_json(folder).each do |meta_key|
          meta = @storage.read_json(meta_key)
          png_key = Storage.png_for(meta_key, meta)
          next unless AWS::S3.exists_in_bucket(@storage.bucket, @storage.full_key(png_key))

          img = @storage.read_png(png_key)
          if too_transparent?(img, threshold: transparency_threshold)
            regenerate(meta_key, meta, png_key) if @regenerate && @openai
            next
          end

          body, sec, ter = @palette.extract(img)
          if needs_patch?(meta, body, sec, ter)
            meta["body_color"] = body
            meta["secondary_color"] = sec
            meta["tertiary_color"] = ter
            @storage.write_json(meta_key, Metadata::Record.dump(meta))
          end
        end
      end
    end

    private def needs_patch?(meta, body, sec, ter)
      meta["body_color"] != body || meta["secondary_color"] != sec || meta["tertiary_color"] != ter
    end

    private def too_transparent?(img, threshold:)
      alpha = img.alpha_channel
      (alpha.count {|a| a == 0}.to_f / alpha.size) >= threshold
    end

    private def regenerate(meta_key, meta, png_key)
      dest_png_key, dest_meta_key =
        if @regen_mode == :separate
          Storage.mirror_keys(@regen_root, meta_key, png_key)
        else
          [png_key, meta_key]
        end

      prompt = meta["prompt_used"] || PromptBuilder.new.build(meta.symbolize_keys.slice(:adj, :animal, :attire))
      b64 = @openai.images.generate(
        parameters: {model: "gpt-image-1", prompt:, size: "1024x1024", n: 1, background: "transparent"}
      ).dig("data", 0, "b64_json")

      @storage.write_png_base64(dest_png_key, b64)
      img2 = @storage.read_png(dest_png_key)
      body, sec, ter = @palette.extract(img2)

      new_meta = meta.merge(
        "file_name"          => File.basename(dest_png_key),
        "body_color"         => body,
        "secondary_color"    => sec,
        "tertiary_color"     => ter,
        "regenerated"        => true,
        "regen_reason"       => "too_transparent",
        "regen_output_mode"  => @regen_mode.to_s
      )
      @storage.write_json(dest_meta_key, Metadata::Record.dump(new_meta))
    end
  end
end
