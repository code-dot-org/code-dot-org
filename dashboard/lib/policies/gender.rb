class Policies::Gender
  module MatchingPatterns
    MALE_REGEXES = [
      /^m$/,
      /\bmale/,
      /boy/,
      /guy/,
      /\bm(a|e)n/,
      /masculin/,
      /him/,
      /\bhe\b/,
      /hombre/,
      /dude/,
      /\bmail/,
      # Korean
      /남자/,
      /남성/,
      # Turkish
      /erkek/,
      # Indonesian
      /laki[ -]?laki/,
      # German
      /männlich/,
      /mänlich/,
      # Dutch
      /jongen/,
      # Czech
      /muž/,
      # Polish
      /mężczyzna/,
      # French
      /homme/,
      # Italian
      /maschio/,
      /uomo/,
      # Spanish
      /macho/,
      /chico/,
      # Swedish
      /pojke/,
      # Misspellings
      /mal/,
      /homem/,
    ]

    FEMALE_REGEXES = [
      /^f$/,
      /\bfemal/,
      /girl/,
      /gal/,
      /\bwom(a|e)n/,
      /fem(e|i)nin/,
      /she/,
      /\bher/,
      /mujer/,
      /\bfemail/,
      /\bfem/,
      # Korean
      /여자/,
      /여성/,
      /여\b/,
      # Turkish
      /kız/,
      /kadın/,
      # Indonesian
      /perempuan/,
      # Farsi
      /أنثى/,
      /بنت/,
      /انثي/,
      # Croatian
      /žena/,
      # German
      /weiblich/,
      # Dutch
      /vrouw/,
      /meisje/,
      # Polish
      /kobieta/,
      # French
      /fille/,
      /féminin/,
      # Italian
      /donna/,
      # Spanish
      /chica/,
      # Danish
      /kvinde/,
      /pige/,
      # Swedish
      /tjej/,
      /kvinna/,
      # Khmer
      /ស្រី/,
      # Misspellings
      /famale/,
      /gril/,
    ]

    NON_BINARY_REGEXES = [
      /^n$/,
      /^x$/,
      /they/,
      /them/,
      /non((\ |-)?)binary/,
      /inter(\ )?sex/,
      /gender(\ )?fluid/,
      /inter(\ )?gender/,
      /agender/,
      /boyflux/,
      /\btrans/,
      /\bit/,
    ]
  end

  module NormalizedValues
    NON_BINARY = 'n'.freeze
    MALE = 'm'.freeze
    FEMALE = 'f'.freeze
    OTHER = 'o'.freeze
  end
end
