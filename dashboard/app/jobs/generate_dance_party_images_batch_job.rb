class GenerateDancePartyImagesBatchJob < ApplicationJob
  queue_as :images

  # options: { repeats_per_combo:, bucket:, namespace:, sets: %i[animal animal_attire adj_animal_attire] }
  def perform(options = {})
    animals    = DancePartyImageGenerator::Settings.animals
    attire     = DancePartyImageGenerator::Settings.attire
    adjectives = DancePartyImageGenerator::Settings.adjectives
    repeats    = (options[:repeats_per_combo] || DancePartyImageGenerator::Settings.repeats).to_i
    bucket     = options[:bucket]    || DancePartyImageGenerator::Settings.bucket
    namespace  = options[:namespace] || DancePartyImageGenerator::Settings.namespace
    sets       = Array(options[:sets]).presence || %i[animal animal_attire adj_animal_attire]

    # Build deduped plan in required order per animal:
    # 1) animal
    # 2) animal + attire
    # 3) adjective + animal + attire
    combos = []
    animals.each do |animal|
      combos << {animal:, adj: nil, attire: nil} if sets.include?(:animal)
      if sets.include?(:animal_attire)
        attire.each {|att| combos << {animal:, adj: nil, attire: att}}
      end
      if sets.include?(:adj_animal_attire)
        attire.each do |att|
          adjectives.each do |adj|
            combos << {animal:, adj:, attire: att}
          end
        end
      end
    end

    # Enqueue each variant as its own job for maximum parallelism
    count = 0
    combos.each do |combo|
      repeats.times do |v|
        item = combo.merge(variant: v)
        dest =
          if combo[:adj].nil? && combo[:attire].nil?
            :animal
          elsif combo[:adj].nil? && combo[:attire].present?
            :animal_attire
          else
            :adj_animal_attire
          end

        GenerateOneDancePartyImageJob.perform_later(
          item,
          dest,
          {bucket:, namespace: namespace}
        )
        count += 1
      end
    end

    Rails.logger.info("[DPIG] Enqueued #{count} image jobs (bucket=#{bucket}, ns=#{namespace || '(none)'}).")
  end
end
