require 'digest/md5'

# A specific solution attempt for a specific level
class LevelSource < ActiveRecord::Base
  belongs_to :level
  has_one :level_source_image
  has_many :level_source_hints

  has_many :activities

  validates_length_of :data, :maximum => 20000

  # This string used to sometimes appear in program XML.
  # We now strip it out, but it remains in some old LevelSource.data.
  # A level_source is considered to be standardized if it does not have this.
  XMLNS_STRING = ' xmlns="http://www.w3.org/1999/xhtml"'

  def LevelSource.cache_enabled?
    @@cache_enabled ||= false
    rack_env?(:production) || @@cache_enabled
  end

  def LevelSource.level_source_cache()
    @@level_sources_redis ||= rack_env?(:production) ? Redis.connect(url:CDO.level_sources_redis_url) : Hash.new
  end

  def self.find_identical_or_create(level, data)
    md5 = Digest::MD5.hexdigest(data)

    redis_key = "v5-#{level.id}-#{md5}"

    cached_json = LevelSource.level_source_cache[redis_key] if LevelSource.cache_enabled?
    level_source_object = OpenStruct.new(JSON.parse(cached_json)) if cached_json

    unless level_source_object
      level_source_object = self.where(level: level, md5: md5).first_or_create do |ls|
        ls.data = data
      end
      return nil unless level_source_object

      level_source_hash = {id:level_source_object.id, hidden:level_source_object.hidden}
      LevelSource.level_source_cache[redis_key] = level_source_hash.to_json if LevelSource.cache_enabled?

      level_source_object = OpenStruct.new(level_source_hash)
    end

    level_source_object
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
    if result.nil? && experiment_hints.length > 0
      result = experiment_hints.sample
    end

    result
  end

  public
  def get_crowdsourced_hint
    return nil if I18n.locale != :'en-us'
    get_hint_from_source_internal(including: LevelSourceHint::CROWDSOURCED)
  end

  def get_hint_from_any_source
    get_hint_from_source_internal({})
  end

  # Get a hint that is NOT crowdsourced.
  def get_external_hint
    return nil if I18n.locale != :'en-us'
    get_hint_from_source_internal(excluding: LevelSourceHint::CROWDSOURCED)
  end

  # If source is nil, nil is returned.
  def get_hint_from_source(source)
    unless source.nil?
      get_hint_from_source_internal(including: source)
    end
  end
end
