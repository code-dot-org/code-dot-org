# A product tour written in the tour editor and shared by every level of one
# lab. Each tour is one file, config/product_tours/<lab>/<id>.json, edited on
# levelbuilder and committed with the rest of the curriculum. A level uses a
# tour by listing its id in the level's tour_references property.
class ProductTour
  CONFIG_DIRECTORY = Rails.root.join('config', 'product_tours')
  NAME_FORMAT = /\A[a-z0-9][a-z0-9_-]*\z/

  class InvalidTour < StandardError; end

  def self.all(lab)
    return [] unless NAME_FORMAT.match?(lab.to_s)
    Dir.glob(directory(lab).join('*.json')).map {|path| JSON.parse(File.read(path))}.
      sort_by {|tour| tour['name'].to_s.downcase}
  end

  def self.write(lab, tour)
    raise InvalidTour, 'tour must be an object' unless tour.is_a?(Hash)
    raise InvalidTour, "bad tour id #{tour['id'].inspect}" unless NAME_FORMAT.match?(tour['id'].to_s)
    raise InvalidTour, 'tour steps must be a list' unless tour['steps'].is_a?(Array)
    FileUtils.mkdir_p(directory(lab))
    File.write(path(lab, tour['id']), JSON.pretty_generate(tour.slice('id', 'name', 'steps')) + "\n")
  end

  def self.delete(lab, id)
    raise InvalidTour, "bad tour id #{id.inspect}" unless NAME_FORMAT.match?(id.to_s)
    FileUtils.rm_f(path(lab, id))
  end

  # Levels of the lab that use each tour: {tour id => [{id:, name:, label:, url:}]}.
  def self.usage(lab)
    game_ids = Game.where(app: lab).pluck(:id)
    Level.where(game_id: game_ids).
      where("JSON_LENGTH(properties, '$.tour_references') > 0").
      includes(script_levels: [:lesson, :script]).
      each_with_object(Hash.new {|hash, key| hash[key] = []}) do |level, usage|
        entry = usage_entry(level)
        level.properties['tour_references'].each do |reference|
          usage[reference['id']] << entry
        end
      end
  end

  # A level in a unit is named by its place there, e.g. "csd3 · Lesson 2 · Level 4".
  def self.usage_entry(level)
    script_level = level.script_levels.first
    lesson = script_level&.lesson
    unless lesson
      return {id: level.id, name: level.name, label: level.name, url: "/levels/#{level.id}/edit"}
    end
    unit = script_level.script
    {
      id: level.id,
      name: level.name,
      label: "#{unit.name} · Lesson #{lesson.relative_position} · Level #{script_level.position}",
      url: "/s/#{unit.name}/lessons/#{lesson.relative_position}/levels/#{script_level.position}",
    }
  end

  def self.directory(lab)
    raise InvalidTour, "bad lab #{lab.inspect}" unless NAME_FORMAT.match?(lab.to_s)
    CONFIG_DIRECTORY.join(lab)
  end

  def self.path(lab, id)
    directory(lab).join("#{id}.json")
  end
end
