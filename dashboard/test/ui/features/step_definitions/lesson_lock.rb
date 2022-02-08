Then /^I verify the lesson named "([^"]*)" is (locked|unlocked)/ do |lesson_name, lock_status|
  lesson_selector = "td:contains(#{lesson_name})"
  lock_icon_selector = lock_status == "locked" ?
    "td:contains(#{lesson_name}) .fa-lock" :
    "td:contains(#{lesson_name}) .fa-unlock"

  wait_short_until do
    @browser.execute_script(jquery_is_element_visible(lesson_selector)) &&
      @browser.execute_script(jquery_is_element_visible(lock_icon_selector))
  end
end
