#!/usr/bin/ruby

# The list of tutorials. Note that relative order matters, e.g., it is important
# that "starwarsblocks" proceeds "starwars" as the latter will match the regex
# for the former.
tutorials = %w(
  russia_mc
  static_mc
  mc
  disney_static_starwarsblocks
  disney_static_starwars
  static_starwars
  starwarsblocks
  starwars
  tynkerapp
  tynker
  frozen
  flappy
  hourofcode
  codecombat
  lightbotintl
  lightbot2
  lightbot
  scratch
  khanes
  khanfr
  khanhe
  khanpl
  khanpt
  khan
  playlab
  makegameswithus
  touchdevelop
  codemonkey
  codecademy
  processing
  codespark
  groklearning
  appinventor
  codeavengers
  codehs
  bitsbox
  agentcubes
  gumball
  artist
  blockly
  infinity
  robomindnl
  robomind
  iceage
  codeintl
  allcancode
  hopscotch
  makeschool
  condcards
  monstercoding
  thinkersmithspanish
  thinkersmith2
  thinkersmith
  lookingglass
  csfirst
  livecode
  alice2
  alice
  quorum
  projguts
  codesters
  boxisland
  teacherled
  kodableunplugged
  kodableapp
  kodable
  texasinstruments
  baymaxes
  pixies
  finchrobot
)

LONG_VALUE_SUM = "LongValueSum:"

ARGF.each do |line|
  # The line starts with a timestamp of the form YYYY-MM-DDTHH:MM:SS.XXXXXXZ,
  # from which we extract only the date for aggregation.
  date = line[0..9]

  tutorials.each do |t|
    # Using LONG_VALUE_SUM instructs hadoop's streaming aggregate class how to
    # aggregate. Using the date, type (begin, beginpng, 443), and tutorial as
    # the key gives breakdowns by day, type, and tutorial.
    if line.include? "begin" + "\/" + t
      puts LONG_VALUE_SUM + date + " begin " + t + "\t" + "1"
      break
    elsif (line.include? "begin_" + t + ".png")
      puts LONG_VALUE_SUM + date + " beginpng " + t + "\t" + "1"
      break
    elsif (line.include? "443" + "\/" + t)
      puts LONG_VALUE_SUM + date + " 443 " + t + "\t" + "1"
      break
    end
  end
end
