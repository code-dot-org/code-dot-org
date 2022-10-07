@single_session
Feature: Setup Guide

Scenario: Viewing the Setup Guide in Spanish
  Given I am on "https://studio.code.org/maker/setup/lang/es-MX"
  And I rotate to landscape
  Then element "#maker-setup h1" has "es-MX" text from key "applab.makerSetupPageTitle"
  Then element "#circuit-playground-description h2" has "es-MX" text from key "applab.makerSetupCircuitPlaygroundTitle"
  Then element "#circuit-playground-description div" has "es-MX" markdown from key "applab.makerSetupCircuitPlaygroundDescription"

Scenario: Viewing the microbit Setup Guide in Spanish
  Given I am on "http://studio.code.org/maker/setup?lang=es-MX&disableExperiments=microbit"
  And I rotate to landscape
  Then element "#maker-setup h1" has "es-MX" text from key "applab.makerSetupPageTitle"
  Then element "#circuit-playground-description h2" has "es-MX" text from key "applab.makerSetupCircuitPlaygroundTitle"
  Then element "#circuit-playground-description div" has "es-MX" markdown from key "applab.makerSetupCircuitPlaygroundDescription"
  Then element "#microbit-description h2" has "es-MX" text from key "applab.makerSetupMicrobitTitle"
  Then element "#microbit-description div" has "es-MX" markdown from key "applab.makerSetupMicrobitDescription"