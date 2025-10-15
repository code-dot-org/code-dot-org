class DoctorDancePartyImagesBatchJob < ApplicationJob
  queue_as :images

  # options: {
  #   bucket:, namespace:, folders:, transparency_threshold:, regenerate:, regen_namespace:,
  #   force_recompute_colors:, normalize_grays:
  # }
  def perform(options = {})
    bucket     = options[:bucket]     || DancePartyImageGenerator::Settings.bucket
    namespace  = options[:namespace]  || DancePartyImageGenerator::Settings.namespace
    folders    = Array(options[:folders]).presence || %w[animal animal-attire adjective-animal-attire]
    regen      = !!options[:regenerate]
    regen_ns   = options[:regen_namespace] # write regens into a different S3 prefix (optional)
    threshold  = (options[:transparency_threshold] || 0.90).to_f
    force_cols = !!options[:force_recompute_colors]
    normalize  = options.key?(:normalize_grays) ? !!options[:normalize_grays] : true

    storage = DancePartyImageGenerator::Storage::S3Storage.new(bucket: bucket, namespace: namespace)

    total = 0
    folders.each do |folder|
      storage.list_json(folder).each do |meta_key|
        DoctorOneDancePartyImageJob.perform_later(
          meta_key,
          {
            bucket: bucket,
            namespace: namespace,
            transparency_threshold: threshold,
            regenerate: regen,
            regen_namespace: regen_ns,
            force_recompute_colors: force_cols,
            normalize_grays: normalize
          }
        )
        total += 1
      end
    end

    Rails.logger.info("[DPIG][DoctorBatch] Enqueued #{total} doctor jobs " \
                      "(bucket=#{bucket}, ns=#{namespace || '(none)'})."
)
  end
end
