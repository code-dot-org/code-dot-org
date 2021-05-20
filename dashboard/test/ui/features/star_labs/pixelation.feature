@no_mobile
Feature: Pixelation levels
  # Skip on IE due to blocked pop-ups
  @no_ie @as_student
  Scenario: Pixelation version 2 in black and white with no sliders
    Given I am on the 1st pixelation test level
    And pixelation data has text "0000 0011 0000 0010 0 1 0"

    When I press keys "1" for element "#pixel_data"
    And pixelation data has text "0000 0011 0000 0010 0 1 0 1"
    And I finish pixelation level and reload
    Then pixelation data has text "0000 0011 0000 0010 0 1 0 1"

    When I press the "hex" button
    And pixelation data has text "03 02 5"
    And I press keys "F" for element "#pixel_data"
    And I save pixelation data and reload
    Then pixelation data has text "0000 0011 0000 0010 0 1 0 1 1 1 1 1"

  # Skip on IE due to blocked pop-ups
  @no_ie @as_student
  Scenario: Pixelation version 3 in color with sliders
    Given I am on the 2nd pixelation test level
    And pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110"

    When I press keys "111" for element "#pixel_data"
    And pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111"
    And I finish pixelation level and reload
    Then pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111"

    When I press the "hex" button
    And pixelation data has text "04 02 03 1E23B8"
    And I press keys "e1" for element "#pixel_data"
    And I save pixelation data and reload
    Then pixelation data has text "0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111 000 111 000 01"

  # Skip on IE due to blocked pop-ups
  @no_ie @as_student
  Scenario: Pixelation version 3 in color with sliders starting in hex mode
    Given I am on the 3rd pixelation test level
    And pixelation data has text "04 04 18 FF0000 00AAAA"

    When I press keys "999999" for element "#pixel_data"
    And pixelation data has text "04 04 18 FF0000 00AAAA 999999"
    And I finish pixelation level and reload
    Then pixelation data has text "04 04 18 FF0000 00AAAA 999999"

    When I press the "bin" button
    And pixelation data has text "0000 0100 0000 0100 0001 1000 111111110000000000000000 000000001010101010101010 100110011001100110011001 "
    # Workaround: Safari doesn't move the text-insertion caret to the end of existing content.
    And I select the end of "#pixel_data"
    And I press keys "110011001100110011111111" for element "#pixel_data"
    Then pixelation data has text "0000 0100 0000 0100 0001 1000 111111110000000000000000 000000001010101010101010 100110011001100110011001 110011001100110011111111"
    And I save pixelation data and reload
    Then pixelation data has text "04 04 18 FF0000 00AAAA 999999 CCCCFF"

  Scenario: Pixelation version 1 with encoding controls hidden but sliders visible
    Given I am on the 4th pixelation test level
    And pixelation data has text "FF0000 00AAAA"
    Then element "input[name='binHex'][value='bin']" is not visible
    And element "input[name='binHex'][value='hex']" is not visible
    And element "#widthRange" is visible
    And element "#heightRange" is visible
    And element "#width" is not readonly
    And element "#height" is not readonly

  Scenario: Pixelation version 1 with sliders hidden but encoding controls visible
    Given I am on the 5th pixelation test level
    And pixelation data has text "FF0000 00AAAA"
    Then element "input[name='binHex'][value='bin']" is visible
    And element "input[name='binHex'][value='hex']" is visible
    And element "#widthRange" is not visible
    And element "#heightRange" is not visible
    And element "#width" is readonly
    And element "#height" is readonly
