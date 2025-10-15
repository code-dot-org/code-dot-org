class RefreshPaletteBatchJob < ApplicationJob
  queue_as :images

  # opts: { bucket:, namespace:, folders:, force:, normalize_grays: }
  def perform(opts = {})
    bucket     = opts[:bucket]    || DancePartyImageGenerator::Settings.bucket
    namespace  = opts[:namespace] || DancePartyImageGenerator::Settings.namespace
    folders    = Array(opts[:folders]).presence || %w[animal animal-attire adjective-animal-attire]
    force      = !!opts[:force]
    normalize  = opts.key?(:normalize_grays) ? !!opts[:normalize_grays] : true

    storage = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)

    total = 0
    folders.each do |folder|
      storage.list_json(folder).each do |meta_key|
        RefreshPaletteOneJob.perform_later(meta_key, {
                                             bucket: bucket, namespace: namespace, force: force, normalize_grays: normalize
                                           }
)
        total += 1
      end
    end
    Rails.logger.info("[DPIG][PaletteBatch] Enqueued #{total} palette jobs.")
  end
end
