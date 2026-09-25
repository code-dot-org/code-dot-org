require_relative 'hooks_utils'
require_relative '../../lib/cdo/levelbuilder_content_restrictions'

# Exit if not on levelbuilder branch
exit(0) unless LevelbuilderContentRestrictions.levelbuilder_branch?

# Get staged files and validate them
staged_files = HooksUtils.get_staged_files
validation_result = LevelbuilderContentRestrictions.validate_files(staged_files)

# Raise an error if any files are not allowed
unless validation_result[:valid]
  raise validation_result[:message]
end
