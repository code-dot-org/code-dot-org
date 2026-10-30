# Helper steps for assigning and locking lessons

Then /^I scroll our lockable lesson into view$/ do
  # use visible pseudo selector as we also have lock icons in (hidden) summary view
  # and filter out lock icons in the header

  wait_short_until {@browser.execute_script('return $(".fa-lock:visible").not($(".full_progress_inner .fa-lock")).length') > 0}
  @browser.execute_script('$(".fa-lock:visible").not($(".full_progress_inner .fa-lock"))[0].scrollIntoView(true)')
end

# LessonLockDialog and SendLessonDialog migrated from BaseDialog (which emitted
# `.modal-body` / `.modal`) to the DSCO Modal (which emits `role="dialog"` and
# module-hashed class names). Selectors below use the ARIA role so they work
# with both the legacy and migrated dialogs.

Then /^I open the lesson lock dialog$/ do
  wait_for_jquery
  wait_short_until {@browser.execute_script("return $('.uitest-locksettings').length") > 0}
  @browser.execute_script("$('.uitest-locksettings').children().first().click()")
  wait_short_until {jquery_is_element_visible("[role='dialog']")}
  sleep 2 # Temporary workaround for LP-2194
end

Then /^I open the lesson lock dialog for lockable lesson (\d+)$/ do |lockable_lesson_num|
  wait_for_jquery
  wait_short_until {@browser.execute_script("return $('.uitest-locksettings').length") > 0}
  @browser.execute_script("$('.uitest-locksettings').eq(#{lockable_lesson_num - 1}).children().first().click()")
  wait_short_until {jquery_is_element_visible("[role='dialog']")}
  sleep 2 # Temporary workaround for LP-2194
end

Then /^I open the send lesson dialog for lesson (\d+)$/ do |lesson_num|
  wait_for_jquery
  wait_short_until {@browser.execute_script("return $('.uitest-sendlesson').length") > lesson_num}
  @browser.execute_script("$('.uitest-sendlesson').eq(#{lesson_num - 1}).children().first().click()")
  wait_short_until {jquery_is_element_visible("[role='dialog']")}
end

Then /^I unlock the lesson for students$/ do
  @browser.execute_script("$(\"[role='dialog'] button:contains(Allow editing)\").click()")
  @browser.execute_script("$(\"[role='dialog'] button:contains(Save)\").click()")
end

Then /^I lock the lesson for students$/ do
  @browser.execute_script("$(\"[role='dialog'] button:contains(Lock lesson)\").click()")
  @browser.execute_script("$(\"[role='dialog'] button:contains(Save)\").click()")
end

Then /^I show lesson answers for students$/ do
  @browser.execute_script("$(\"[role='dialog'] button:contains(Show answers)\").click()")
  @browser.execute_script("$(\"[role='dialog'] button:contains(Save)\").click()")
end
