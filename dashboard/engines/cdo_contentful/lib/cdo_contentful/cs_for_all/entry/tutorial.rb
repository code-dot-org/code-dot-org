# frozen_string_literal: true

module CdoContentful
  module CsForAll
    module Entry
      module Tutorial
        include Base

        self.content_type = 'curriculum'

        # Find a Tutorial entry by its custom `tutorialID` field
        #
        # @param code [String] the `tutorialID` custom field
        #
        # @return [Contentful::Entry, nil] the first entry matching the given `tutorialID`
        def self.find_by_code(code)
          find_by(tutorialID: code)
        end
      end
    end
  end
end
