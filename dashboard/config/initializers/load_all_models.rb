# load all the model classes on startup to avoid problems with Marshal.load
# egrep -r '^class' app/models | cut -d' ' -f2 | ruby -pe '$_ = $_.strip + ",\n"'
if Dashboard::Application.config.eager_load
  [
    Activity,
    Artist,
    Blockly,
    Calc,
    Callout,
    Concept,
    DSLDefined,
    Eval,
    Follower,
    Game,
    Grid,
    Karel,
    Level,
    LevelSource,
    LevelSourceImage,
    Match,
    Maze,
    Multi,
    NetSim,
    Script,
    ScriptLevel,
    SecretPicture,
    SecretWord,
    Section,
    Lesson,
    Studio,
    TextMatch,
    Unplugged,
    User,
    UserLevel,
    UserScript,
    Video
  ].each(&:new)
end
