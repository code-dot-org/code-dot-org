# frozen_string_literal: true

module CdoContentful
  module CsForAll
    module Entry
      module Tutorial
        include Base

        self.content_type = 'curriculum'

        def self.find_by_tutorial_id(tutorial_id)
          find_by(tutorialID: tutorial_id)
        end
      end
    end
  end
end
