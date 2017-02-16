# This file is generated via generateSharedConstants.rb. DO NOT CHANGE MANUALLY

module SharedConstants
  # Used to communicate different types of levels
  LevelKind = OpenStruct.new(
    {
      "peer_review": "peer_review",
      "assessment": "assessment",
      "puzzle": "puzzle",
      "unplugged": "unplugged",
      "level": "level"
    }
  )

  # Different possibilities for level.status, used to communicate how user has performed on a given level
  LevelStatus = OpenStruct.new(
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
  )
end
