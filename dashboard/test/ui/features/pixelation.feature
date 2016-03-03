@as_student
@dashboard_db_access
@no_mobile
@no_safari
Feature: Pixelation levels
  Scenario: Pixelation version 2 in black and white with no sliders
    Given I am on "http://studio.code.org/s/allthethings/stage/17/puzzle/1?noautoplay=true"
    And I wait to see a visible dialog with title containing "Puzzle 1"
    And I close the dialog
    And pixelation data has text "0000 0011 0000 0010 0 1 0"

    When I press keys "1" for element "#pixel_data"
    And pixelation data has text "0000 0011 0000 0010 0 1 0 1"
    And I finish pixelation level and reload
    Then pixelation data has text "0000 0011 0000 0010 0 1 0 1"

    When I click selector "input[value='hex']"
    And pixelation data has text "03 02 5"
    And I press keys "F" for element "#pixel_data"
    And I save pixelation data and reload
    Then pixelation data has text "0000 0011 0000 0010 0 1 0 1 1 1 1 1"

  Scenario: Pixelation version 3 in color with sliders
    Given I am on "http://studio.code.org/s/allthethings/stage/17/puzzle/2?noautoplay=true"
    And I wait to see a visible dialog with title containing "Puzzle 2"
    And I close the dialog
    And pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110"

    When I press keys "111" for element "#pixel_data"
    And pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111"
    And I finish pixelation level and reload
    Then pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111"

    When I click selector "input[value='hex']"
    And pixelation data has text "04 02 03 1E23B8"
    And I press keys "e1" for element "#pixel_data"
    And I save pixelation data and reload
    Then pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111 000 111 000 01"

  Scenario: Pixelation version 3 in color with sliders starting in hex mode
    Given I am on "http://studio.code.org/s/allthethings/stage/17/puzzle/3?noautoplay=true"
    And I wait to see a visible dialog with title containing "Puzzle 3"
    And I close the dialog
    And pixelation data has text "04 04 18 FF0000 00AAAA"

    When I press keys "999999" for element "#pixel_data"
    And pixelation data has text "04 04 18 FF0000 00AAAA 999999"
    And I finish pixelation level and reload
    Then pixelation data has text "04 04 18 FF0000 00AAAA 999999"

    When I click selector "input[value='bin']"
    And pixelation data has text "0000 0100 0000 0100 0001 1000 111111110000000000000000 000000001010101010101010 100110011001100110011001 "
    And I press keys "110011001100110011111111" for element "#pixel_data"
    And I save pixelation data and reload
    Then pixelation data has text "04 04 18 FF0000 00AAAA 999999 CCCCFF"
