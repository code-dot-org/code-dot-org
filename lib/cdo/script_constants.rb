# Info on existing tutorial scripts on Code Studio,
# sometimes referenced in Pegasus.
# Used for conditional behaviors.

module ScriptConstants
  HOC_2013_NAME = 'Hour of Code' # this is the old (2013) hour of code
  EDIT_CODE_NAME = 'edit-code'
  TWENTY_FOURTEEN_NAME = 'events'
  JIGSAW_NAME = 'jigsaw'
  HOC_NAME = 'hourofcode' # name of the new (2014) hour of code script
  STARWARS_NAME = 'starwars'
  MINECRAFT_NAME = 'mc'
  STARWARS_BLOCKS_NAME = 'starwarsblocks'
  FROZEN_NAME = 'frozen'
  PLAYLAB_NAME = 'playlab'
  GUMBALL_NAME = 'gumball'
  ICEAGE_NAME = 'iceage'
  INFINITY_NAME = 'infinity'
  ARTIST_NAME = 'artist'
  ALGEBRA_NAME = 'algebra'
  FLAPPY_NAME = 'flappy'
  TWENTY_HOUR_NAME = '20-hour'
  COURSE1_NAME = 'course1'
  COURSE2_NAME = 'course2'
  COURSE3_NAME = 'course3'
  COURSE4_NAME = 'course4'

  MINECRAFT_TEACHER_DASHBOARD_NAME = 'minecraft'
  HOC_TEACHER_DASHBOARD_NAME = 'classicmaze'

  def ScriptConstants.twenty_hour?(name)
    name == TWENTY_HOUR_NAME
  end

  def ScriptConstants.hoc?(name)
    # Note that now multiple scripts can be an 'hour of code' script.
    # If adding a script here,
    # you must also update the Data_HocTutorials gsheet so the end of script API works
    [
        nil,
        HOC_2013_NAME,
        HOC_NAME,
        FROZEN_NAME,
        FLAPPY_NAME,
        PLAYLAB_NAME,
        GUMBALL_NAME,
        ICEAGE_NAME,
        STARWARS_NAME,
        STARWARS_BLOCKS_NAME,
        MINECRAFT_NAME
    ].include? name
  end

  def ScriptConstants.flappy?(name)
    name == FLAPPY_NAME
  end

  def ScriptConstants.minecraft?(name)
    name == MINECRAFT_NAME
  end
end
