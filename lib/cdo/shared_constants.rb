# A set of constants shared between ruby and JS via /shared/config/sharedConstants.json
require 'json'

def constants
  return @@constants
  file = File.read(File.join(__dir__, '../../shared/config/constants.json'))
  json = JSON.parse(file)

module SharedConstants
  def constants
    return @@constants if @@constants

  end
  LevelKind = Hash[json['LevelKinds'].map{|kind| [kind, kind]}]
end

puts SharedConstants::LevelKind
