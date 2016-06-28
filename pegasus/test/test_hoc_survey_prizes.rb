require_relative 'sequel_test_case'
require_relative '../../pegasus/helpers/prize_helpers'
require 'securerandom'

class HocSurveyPrizeTest < SequelTestCase

  TYPE1 = 'apple'
  TYPE2 = 'orange'
  USER1 = 'user1@code.org'
  USER2 = 'user2@code.org'
  PURPOSE1 = 'test'
  PURPOSE2 = 'new event'

  def setup
    @codes = {}
  end

  def test_claim
    generate_codes TYPE1 => 1

    code = claim_prize_code TYPE1, USER1, PURPOSE1
    assert_equal expected, code
  end

  def test_out_of_codes
    generate_codes TYPE1 => 1

    ex = assert_raises AbortFormError do
      claim_prize_code TYPE2, USER1, PURPOSE1
    end
    assert_equal "Out of '#{TYPE2}' codes.", ex.message
  end

  def test_reclaim_old
    generate_codes TYPE1 => 2

    claim1 = claim_prize_code TYPE1, USER1, PURPOSE1
    claim2 = claim_prize_code TYPE1, USER1, PURPOSE1

    assert_equal expected, claim1
    assert_equal claim1, claim2
  end

  def test_reclaim_wrong_type
    generate_codes TYPE1 => 2
    generate_codes TYPE2 => 2

    claim1 = claim_prize_code TYPE1, USER1, PURPOSE1
    claim2 = claim_prize_code TYPE2, USER1, PURPOSE1
    assert_equal expected, claim1
    assert_equal 'None', claim2
  end

  def test_new_event
    generate_codes TYPE1 => 4

    claim1 = claim_prize_code TYPE1, USER1, PURPOSE1
    claim2 = claim_prize_code TYPE1, USER1, PURPOSE2
    claim3 = claim_prize_code TYPE1, USER2, PURPOSE1
    claim4 = claim_prize_code TYPE1, USER1, PURPOSE2 # should return claim2 again
    assert_equal expected(TYPE1,0), claim1
    assert_equal expected(TYPE1,1), claim2
    assert_equal expected(TYPE1,2), claim3
    assert_equal claim2, claim4
  end

  private

  def expected(type=TYPE1, index=0)
    @codes[type][index]
  end

  # Accepts a hash of type: number for each type of code to be randomly generated
  def generate_codes(codes_descriptor)
    codes_descriptor.each do |type, num|
      num.to_i.times do
        generate_code type
      end
    end
  end

  # Generates a random code of the specified type, adds it to the DB, and appends to an array in @codes, keyed by the type
  def generate_code(type)
    code = SecureRandom.hex 10
    DB[:hoc_survey_prizes].insert(type: type, value: code)
    @codes[type] = [] unless @codes[type]
    @codes[type] << code
    code
  end
end
