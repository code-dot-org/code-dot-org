# Manipulate Source JSON for projects
class ProjectSourceJson
  def initialize(source_string)
    @parsed_json = JSON.parse(source_string)
  end

  def each_animation
    @parsed_json['animations']['orderedKeys'].each do |key|
      yield @parsed_json['animations']['propsByKey'][key]
    end
  end

  def set_animation_version(key, version)
    @parsed_json['animations']['propsByKey'][key]['version'] = version
  end

  def to_json
    JSON.generate(@parsed_json)
  end
end
