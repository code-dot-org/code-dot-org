# == Schema Information
#
# Table name: level_sources
#
#  id         :integer          not null, primary key
#  level_id   :integer
#  md5        :string(32)       not null
#  data       :string(20000)    not null
#  created_at :datetime
#  updated_at :datetime
#  hidden     :boolean          default(FALSE)
#
# Indexes
#
#  index_level_sources_on_level_id_and_md5  (level_id,md5)
#

require 'digest/md5'

# A specific solution attempt for a specific level
class LevelSource < ActiveRecord::Base
  belongs_to :level
  has_one :level_source_image
  has_many :level_source_hints

  has_many :activities

  validates_length_of :data, :maximum => 20000
  validates :data, no_utf8mb4: true

  # This string used to sometimes appear in program XML.
  # We now strip it out, but it remains in some old LevelSource.data.
  # A level_source is considered to be standardized if it does not have this.
  XMLNS_STRING = ' xmlns="http://www.w3.org/1999/xhtml"'

  def LevelSource.cache_key(level_id, md5)
    "#{level_id}-#{md5}"
  end

  def LevelSource.find_identical_or_create(level, data)
    md5 = Digest::MD5.hexdigest(data)

    Rails.cache.fetch(cache_key(level.id, md5)) do
      LevelSource.where(level: level, md5: md5).first_or_create do |ls|
        ls.data = data
      end
    end
  end

  # we can't just use an association :through the activities
  # association because of the way the indexes on activities work (we
  # need to add level_id to the query)
  def gallery_activities
    GalleryActivity.
      joins('inner join activities on activities.id = gallery_activities.activity_id').
      where('activities.level_id' => level_id, 'activities.level_source_id' => id)
  end

  def standardized?
    !self.data.include? XMLNS_STRING
  end

  # Get the id of the LevelSource with the standardized version of self.data.
  def get_standardized_id
    if standardized?
      self.id
    else
      data = self.data.gsub(XMLNS_STRING, '')
      LevelSource.where(level_id: self.level_id,
                        data: data,
                        md5: Digest::MD5.hexdigest(data)).first_or_create().id
    end
  end

  # Selects a LevelSourceHint for this level_source having the specified source.
  # This returns the message of the first matching selected? hint with the
  # specified source, or, if none is present, a random experiment? hint
  # with the specified source.
  #
  # The source hash can be any of:
  # - empty: the source field is ignored [default value]
  # - :including => SOURCE, only including messages with the specified SOURCE.
  # - :excluding => SOURCE, excluding messages with the specified SOURCE.
  # An ArgumentError is raised for other or multiple keys.
  #
  # Source constants are defined in level_source_hint.rb.
  def get_hint_from_source_internal(source_hash={})
    result = nil
    experiment_hints = []
    possible_hints = self.level_source_hints

    # Filter possible hints based on argument.
    if source_hash.count == 1
      if source_hash[:including]
        possible_hints = possible_hints.where(source: source_hash[:including])
      elsif source_hash[:excluding]
        possible_hints = possible_hints.
            where('source != ?', source_hash[:excluding])
      else
        raise ArgumentError.new("Unexpected key #{source_hash.keys.first}")
      end
    elsif source_hash.count > 1
      raise ArgumentError.new("Too many keys in hash: #{source_hash.keys}")
    end

    # Find a selected hint, if present, or randomly choose among experiment
    # hints.
    possible_hints.each do |hint|
      if hint.selected?
        # Note that this returns the first selected? hint.
        result = hint
        break
      elsif hint.experiment?
        experiment_hints.push(hint)
      end
    end
    if result.nil? && !experiment_hints.empty?
      result = experiment_hints.sample
    end

    result
  end

  def get_crowdsourced_hint
    return nil unless I18n.en?
    get_hint_from_source_internal(including: LevelSourceHint::CROWDSOURCED)
  end

  def get_hint_from_any_source
    get_hint_from_source_internal({})
  end

  # Get a hint that is NOT crowdsourced.
  def get_external_hint
    return nil unless I18n.en?
    get_hint_from_source_internal(excluding: LevelSourceHint::CROWDSOURCED)
  end

  # If source is nil, nil is returned.
  def get_hint_from_source(source)
    unless source.nil?
      get_hint_from_source_internal(including: source)
    end
  end

  # Old flappy levels used a different block type as their when run. Migrate
  # these as we try to access them
  def replace_old_when_run_blocks()
    if level.game.name == 'Flappy' && data.include?('flappy_whenRunButtonClick')
      self.data = data.gsub('flappy_whenRunButtonClick', 'when_run')
      self.md5 = Digest::MD5.hexdigest(data)
      self.save!
    end
  end
end
