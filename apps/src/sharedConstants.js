// This file is generated via generateSharedConstants.rb. DO NOT CHANGE MANUALLY
// To regenerate, run `rake build:shared_constants` from root

// Used to communicate different types of levels
export const LevelKind = {
  "peer_review": "peer_review",
  "assessment": "assessment",
  "puzzle": "puzzle",
  "unplugged": "unplugged",
  "level": "level"
};

// Different possibilities for level.status, used to communicate how user has performed on a given level
export const LevelStatus = {
  "not_tried": "not_tried",
  "submitted": "submitted",
  "locked": "locked",
  "perfect": "perfect",
  "passed": "passed",
  "attempted": "attempted",
  "review_accepted": "review_accepted",
  "review_rejected": "review_rejected",
  "dots_disabled": "dots_disabled"
};

