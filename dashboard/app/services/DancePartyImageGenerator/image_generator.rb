module DancePartyImageGenerator
  class ImageGenerator
    DEFAULTS = {width: 1024, height: 1024, model: "gpt-image-1", background: "transparent", retries: 5}.freeze
    PATHS = Storage::S3Storage::Storage

    def initialize(openai:, storage:, prompt_builder:, palette_extractor:, logger: Rails.logger, **opts)
      @openai = openai
      @storage = storage
      @prompt = prompt_builder
      @palette = palette_extractor
      @logger = logger
      @cfg = DEFAULTS.merge(opts)
    end

    def call(plan:, dest:)
      plan.each {|item| generate_one(item, dest)}
    end

    private def generate_one(item, dest)
      base     = Naming.base_name(item)
      png_key  = PATHS.path_for(dest: dest, base: base, ext: ".png")
      json_key = PATHS.path_for(dest: dest, base: base, ext: "-metadata.json")

      if AWS::S3.exists_in_bucket(@storage.bucket, @storage.full_key(png_key)) &&
          AWS::S3.exists_in_bucket(@storage.bucket, @storage.full_key(json_key))
        return
      end

      prompt = @prompt.build(item)
      b64    = request_image(prompt)

      @storage.write_png_base64(png_key, b64, width: @cfg[:width], height: @cfg[:height])
      img = @storage.read_png(png_key)

      body, sec, ter = @palette.extract(img)
      record = Metadata::Record.from(
        item,
        file_name: File.basename(png_key),
        prompt_used: prompt,
        body_color: body, secondary_color: sec, tertiary_color: ter
      )
      @storage.write_json(json_key, Metadata::Record.dump(record))
    rescue => exception
      @logger.error("[DPIG][ImageGenerator] generate_one failed for #{base}: #{exception.class}: #{exception.message}")
      # optionally: raise
    end

    private def request_image(prompt)
      resp = @openai.images.generate(
        parameters: {
          model: @cfg[:model], prompt: prompt,
          size: "#{@cfg[:width]}x#{@cfg[:height]}", n: 1, background: @cfg[:background]
        }
      )
      resp.dig("data", 0, "b64_json") || raise("no image data")
    end
  end
end
