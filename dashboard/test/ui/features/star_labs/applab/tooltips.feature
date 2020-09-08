Feature: Applab visualization overlay tooltips

  Background:
    Given I start a new Applab project
    And I switch to design mode

    And I drag a TEXT_AREA into the app
    And I set input "xpos" to "10"
    And I set input "ypos" to "10"

    And I drag a BUTTON into the app
    And I set groupable input "xpos" to "10"
    And I set groupable input "ypos" to "120"

    And I drag a LABEL into the app
    And I set groupable input "xpos" to "10"
    And I set groupable input "ypos" to "160"

    And I drag a TEXT_INPUT into the app
    And I set groupable input "xpos" to "10"
    And I set groupable input "ypos" to "190"

    And I drag a RADIO_BUTTON into the app
    And I set groupable input "xpos" to "10"
    And I set groupable input "ypos" to "230"

    And I drag a CHECKBOX into the app
    And I set input "xpos" to "10"
    And I set input "ypos" to "250"

    And I drag a IMAGE into the app
    And I set input "xpos" to "10"
    And I set input "ypos" to "270"

  @eyes @as_student
  Scenario: Hovering over elements in design mode
    Given I open my eyes to test "tooltips in design mode"
    And I switch to design mode
    And I wait for 1 seconds

    When I hover over element with id "design_text_area1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for text area" using stitch mode "none"

    When I hover over element with id "design_button1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for button" using stitch mode "none"

    When I hover over element with id "design_label1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for label" using stitch mode "none"

    When I hover over the screen at xpos 300 and ypos 100
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for blank screen area at (300, 100)" using stitch mode "none"

    When I hover over element with id "design_text_input1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for text input" using stitch mode "none"

    When I hover over element with id "design_radio_button1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for radio button" using stitch mode "none"

    When I hover over element with id "design_checkbox1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for checkbox" using stitch mode "none"

    When I hover over element with id "design_image1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for image"

    When I hover over the screen at xpos 300 and ypos 200
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for blank screen area at (300, 200)" using stitch mode "none"

    And I close my eyes

  @eyes @as_student
  Scenario: Hovering over elements in code mode
    Given I open my eyes to test "tooltips in code mode"
    And I switch to code mode
    And I wait for 1 seconds

    When I hover over element with id "text_area1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for text area" using stitch mode "none"

    When I hover over element with id "button1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for button" using stitch mode "none"

    When I hover over element with id "label1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for label" using stitch mode "none"

    When I hover over the screen at xpos 300 and ypos 100
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for blank screen area at (300, 100)" using stitch mode "none"

    When I hover over element with id "text_input1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for text input" using stitch mode "none"

    When I hover over element with id "radio_button1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for radio button" using stitch mode "none"

    When I hover over element with id "checkbox1"
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for checkbox" using stitch mode "none"

    When I hover over the screen at xpos 300 and ypos 200
    And I save the project
    And I wait until element ".project_updated_at" contains text "Saved"
    Then I see no difference for "tooltip for blank screen area at (300, 200)" using stitch mode "none"

    And I close my eyes
