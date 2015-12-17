#!/usr/bin/ruby

# The list of tutorials. Note that relative order matters, e.g., it is important
# that "starwarsblocks" proceeds "starwars" as the latter will match the regex
# for the former.
tutorials = [
    "mc",
    "starwarsblocks",
    "starwars",
    "tynker",
    "frozen",
    "flappy",
    "hourofcode",
    "codecombat",
    "tynkerapp",
    "lightbotintl",
    "lightbot2",
    "lightbot",
    "scratch",
    "khanes",
    "khanfr",
    "khanhe",
    "khanpl",
    "khanpt",
    "khan",
    "playlab",
    "makegameswithus",
    "touchdevelop",
    "codemonkey",
    "codecademy",
    "processing",
    "codespark",
    "groklearning",
    "appinventor",
    "codeavengers",
    "codehs",
    "bitsbox",
    "agentcubes",
    "thinkersmith",
    "gumball",
    "artist",
    "blockly",
    "kodable",
    "infinity",
    "robomind",
    "iceage",
    "codeintl",
    "allcancode",
    "hopscotch",
    "makeschool",
    "thinkersmithspanish",
    "condcards",
    "monstercoding",
    "thinkersmith2",
    "kodableunplugged",
    "lookingglass",
    "russia_mc",
    "csfirst",
    "livecode",
    "alice",
    "quorum",
    "projguts",
    "codesters",
    "boxisland",
    "teacherled",
    "kodableapp",
    "texasinstruments",
    "robomindnl",
    "baymaxes",
    "pixies",
    "finchrobot",
    "disney_static_starwars",
    "alice2",
    "static_starwars",
    "static_mc",
    "disney_static_starwarsblocks"
  ]

LONG_VALUE_SUM = "LongValueSum:"

ARGF.each do |line|
  # The line starts with a timestamp of the form YYYY-MM-DDTHH:MM:SS.XXXXXXZ,
  # from which we extract only the date for aggregation.
  date = line[0..9]

  tutorials.each do |t|
    if line.include? t
      # The GET request is surrounded by double quotes, so we exploit this as a
      # delimiter.
      get_request = /GET [^"]*/.match(line).to_s
      # Since the certificate pages have a custom hash, we do not track them.
      # Also, to avoid counting random URLs, we restrict by length.
      if get_request != "" && !(/certificate64/.match(line)) &&
        get_request.length < 75
        # Using LONG_VALUE_SUM instructs hadoop's streaming aggregate class how to
        # aggregate. Using the date and GET request as the key gives breakdowns by
        # day and GET request.
        puts LONG_VALUE_SUM + date + " " + get_request + "\t" + "1"
        break
      end
    end
  end
end
