# frozen_string_literal: true

module Services
  module User
    class GenderNormalizer < Services::Base
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
        /^mal$/,
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
        /^gril$/,
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

      NON_BINARY = 'n'
      MALE = 'm'
      FEMALE = 'f'
      OTHER = 'o'

      attr_reader :raw_input

      def initialize(raw_input:)
        @raw_input = raw_input
      end

      def call
        return if raw_input.blank?

        case raw_input.strip.downcase
        when *NON_BINARY_REGEXES then NON_BINARY
        when *MALE_REGEXES then MALE
        when *FEMALE_REGEXES then FEMALE
        else OTHER
        end
      end
    end
  end
end
