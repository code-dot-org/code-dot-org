@no_mobile
@no_ci
Feature: Multimodal chat using gpt-4o-mini as base model in AI Chat Lab

  Our usage of gpt-4o-mini in AI Chat accepts text, image, and PDF inputs.

  Background:
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/47/levels/6"
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible
    And I dismiss the teacher panel

# Simple text response with OpenAI as base model
  Scenario: Making text chat request gets appropriate response
    When I press keys "Hello" for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    Then element "[aria-label='AI bot chat message']" has css property "background-color" equal to "rgb(224, 248, 249)"

# PDF input
  Scenario: Making PDF chat request gets appropriate response
    When I click selector "#uploadDropdown-dropdown-button"
    And I click selector "button:contains(From Library)" once I see it
    And I click selector "input[name='select-Test PDF.pdf']" once I see it
    And I wait until element "button:contains(Attach)" is enabled using jQuery
    And I press the last button with text "Attach"
    And I press keys "What animal is described in the PDF? Please respond in all lowercase." for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    Then element "[aria-label='AI bot chat message']" contains text "calf"

# Image input
  Scenario: Making image chat request gets appropriate response
    When I click selector "#uploadDropdown-dropdown-button"
    And I click selector "button:contains(From Library)"
    And I click selector "input[name='select-Test Image.jpg']" once I see it
    And I wait until element "button:contains(Attach)" is enabled using jQuery
    And I press the last button with text "Attach"
    And I press keys "What animal do you see in this image?  Please respond in all lowercase." for element "#uitest-chat-textarea"
    And I wait until element "#uitest-chat-submit" is enabled
    And I click selector "#uitest-chat-submit"
    And I wait until element "[aria-label='AI bot chat message']" is visible
    Then element "[aria-label='AI bot chat message']" contains text "cat"
