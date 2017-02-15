# A set of constants shared between ruby and JS via /shared/config/sharedConstants.json
require 'json'

module SharedConstants
  @@json = nil

  def self.json
    return @@json if @@json

    file = File.read(File.join(__dir__, '../../shared/config/constants.json'))
    # @@json = JSON.parse(file)
    @@json = JSON.parse(file, object_class: OpenStruct)
  end

  LevelKind = self.json.LevelKind
end
