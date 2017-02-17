# This is the source of truth for a set of constants that are shared between JS
# and ruby code. generateSharedConstants.rb is the file that processes this and
# outputs JS. It is run via `rake build:shared_constants

module SharedConstants
  # Used to communicate different types of levels
  LEVEL_KIND = OpenStruct.new(
    {
      peer_review: "peer_review",
      assessment: "assessment",
      puzzle: "puzzle",
      unplugged: "unplugged",
      level: "level"
    }
  ).freeze

  # Different possibilities for level.status, used to communicate how user has
  # performed on a given level
  LEVEL_STATUS = OpenStruct.new(
    {
      "not_tried": "not_tried",
      "submitted": "submitted",
      "locked": "locked",
      "perfect": "perfect",
      "passed": "passed",
      "attempted": "attempted",
      "review_accepted": "review_accepted",
      "review_rejected": "review_rejected",
      "dots_disabled": "dots_disabled"
    }
  ).freeze
end
