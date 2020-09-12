# Join table.
# Don't add anything to this model; used for convenience for ActiveRecord Import.
class LevelsScriptLevel < ActiveRecord::Base
  belongs_to :script_level
  belongs_to :level
end