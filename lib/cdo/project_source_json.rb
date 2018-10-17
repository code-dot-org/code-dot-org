# Manipulate Source JSON for projects
class ProjectSourceJson
  def initialize(source_string)
    @parsed_json = JSON.parse(source_string)
  rescue JSON::ParserError
    @unparseable = true
  end

  def each_animation
    return unless animation_manifest?
    @parsed_json['animations']['orderedKeys'].each do |key|
      yield @parsed_json['animations']['propsByKey'][key].merge({'key' => key})
    end
  end

  def set_animation_version(key, version)
    @parsed_json['animations']['propsByKey'][key]['version'] = version
  end

  def to_json
    raise "Can't convert unparseable body to JSON" if @unparseable
    JSON.generate(@parsed_json)
  end

  def animation_manifest?
    !!@parsed_json &&
      @parsed_json['animations'] &&
      @parsed_json['animations']['orderedKeys'] &&
      @parsed_json['animations']['propsByKey']
  end
end
