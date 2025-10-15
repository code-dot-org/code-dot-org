class RefreshPaletteOneJob < ApplicationJob
  queue_as :images
  retry_on StandardError, attempts: 5, wait: :exponentially_longer

  def perform(meta_key, opts = {})
    bucket    = opts[:bucket]
    namespace = opts[:namespace]
    force     = !!opts[:force]
    normalize = opts.key?(:normalize_grays) ? !!opts[:normalize_grays] : true

    storage = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)
    meta    = storage.read_json(meta_key)
    png_key = DancePartyImageGenerator::Storage::S3Storage::Storage.png_for(meta_key, meta)

    full_png = storage.full_key(png_key)
    return unless AWS::S3.exists_in_bucket(bucket, full_png)

    need = force || meta["body_color"].to_s.blank? || meta["secondary_color"].to_s.blank? || meta["tertiary_color"].to_s.blank?
    return unless need

    bytes = AWS::S3.download_from_bucket(bucket, full_png)
    body, sec, ter = DancePartyImageGenerator::PaletteExtractor.extract_png_bytes(bytes, normalize_grays: normalize)
    meta["body_color"] = body
    meta["secondary_color"] = sec
    meta["tertiary_color"] = ter
    storage.write_json(meta_key, DancePartyImageGenerator::Metadata::Record.dump(meta))
  end
end
