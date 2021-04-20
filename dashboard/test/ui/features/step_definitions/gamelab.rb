# Gamelab-specific cucumber step definitions

# Which stage of allthethings.script contains the gamelab levels; this way we
# only have to update in one place if this changes.
GAMELAB_ALLTHETHINGS_STAGE = 19

Given /^I start a new Game ?Lab project$/ do
  steps <<-STEPS
    And I am on "http://studio.code.org/projects/gamelab/new"
    And I rotate to landscape
    And I wait for the page to fully load
  STEPS
end

Given /^I am on the (\d+)(?:st|nd|rd|th)? Game ?Lab test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://studio.code.org/s/allthethings/lessons/#{GAMELAB_ALLTHETHINGS_STAGE}/levels/#{level_index}"
    And I rotate to landscape
    And I wait for the page to fully load
  STEPS
end

When /^I (?:run the game|press run)$/ do
  # Use a short wait to surface any errors that occur during the first few frames
  steps <<-STEPS
    And I press "runButton"
    And I wait for 2 seconds
  STEPS
end

When /^I (?:reset the game|press reset)$/ do
  steps 'And I press "resetButton"'
end

When /^I switch to(?: the)? animation (?:mode|tab)$/ do
  steps 'When I press "animationMode"'
end

When /^I switch to(?: the)? code (?:mode|tab) in Game Lab$/ do
  @browser.execute_script("$(\"#codeMode\")[0].click();")
end

Then /^I do not see "([^"]*)" in the Game Lab console$/ do |message|
  expect(element_contains_text?('#debug-output', message)).to be false
end

Then /^I see (\d+) animations in the animation column$/ do |num_animations|
  expect(@browser.execute_script('return $(".animationList>div>div").not(".newListItem").length')).to eq num_animations.to_i
end

Then /^I open the animation picker$/ do
  @browser.execute_script("$(\".newListItem\")[0].click();")
end

Then /^I select a blank animation$/ do
  @browser.execute_script("$(\".uitest-animation-picker-item\")[0].click();")
end

Then /^I select the animal category of the animation library$/ do
  wait_until {@browser.execute_script("return $(\"img[src*='/category_animals.png']\").length != 0;")}
  @browser.execute_script("$(\"img[src*='/category_animals.png']\")[1].click();")
end

Then /^I select the bear animal head animation from the animal category$/ do
  wait_until {@browser.execute_script("return $(\"img[src*='/category_animals/animalhead_bear.png']\").length != 0;")}
  @browser.execute_script("$(\"img[src*='/category_animals/animalhead_bear.png']\")[0].click();")
end

Then /^I add a new, blank animation$/ do
  steps <<-STEPS
    And I open the animation picker
    And I select a blank animation
  STEPS
end

Then /^I add the bear animal head animation from the library$/ do
  steps <<-STEPS
    And I open the animation picker
    And I select the animal category of the animation library
    And I select the bear animal head animation from the animal category
  STEPS
end

Then /^I append gamelab code to draw a ninja$/ do
  code = <<CODE.gsub(/\n/, '\\n')
function draw() {
  noStroke();

  // Feet
  fill('black');
  ellipse(190, 350, 30, 30);
  ellipse(210, 350, 30, 30);

  // Hands
  fill('black');
  ellipse(145, 310, 30, 30);
  ellipse(260, 300, 30, 30);

  // Body
  fill('white');
  ellipse(200, 300, 110, 110);
  fill('black');
  ellipse(200, 300, 100, 100);

  // Head
  fill('white');
  ellipse(200, 180, 210, 210);
  fill('black');
  ellipse(200, 180, 200, 200);
  fill('white');
  rect(0, 170, 400, 50);
  fill('black');
  ellipse(150, 195, 30, 40);
  ellipse(250, 195, 30, 40);
  fill('white');
  ellipse(155, 190, 6, 8);
  ellipse(255, 190, 6, 8);
}
CODE

  script = <<SCRIPT
var aceEditor = __TestInterface.getDroplet().aceEditor;
aceEditor.navigateFileEnd();
aceEditor.textInput.focus();
aceEditor.onTextInput(\"#{code}\");
SCRIPT

  @browser.execute_script(script)
end
