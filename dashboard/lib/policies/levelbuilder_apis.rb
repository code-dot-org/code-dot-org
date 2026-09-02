module Policies
  module LevelbuilderApis
    # Whether the curriculum editing pages and APIs are reachable by users
    # with the levelbuilder permission. Set directly with levelbuilder_apis
    # (UI test servers, developers running UI tests) or implied by
    # levelbuilder_mode (the authoring environment). Whether an edit is also
    # written back into the repo is levelbuilder_mode's business alone; see
    # Policies::LevelFiles.write_to_file?.
    def self.enabled?
      Rails.application.config.levelbuilder_apis || Rails.application.config.levelbuilder_mode
    end
  end
end
