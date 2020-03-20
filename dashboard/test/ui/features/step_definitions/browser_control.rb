And(/^I change the browser window size to (\d+) by (\d+)$/) do |length, height|
  @browser.manage.window.resize_to(length, height)
end

# for explanation of js function, see
# https://stackoverflow.com/questions/45243992/verification-of-element-in-viewport-in-selenium
And(/^I check that selector "([^"]*)" is in the viewport$/) do |selector|
  is_in_viewport = <<-JAVASCRIPT
    var elem = $("#{selector}")[0],
      box = elem.getBoundingClientRect(),
      cx = box.left + box.width / 2,
      cy = box.top + box.height / 2,
      e = document.elementFromPoint(cx, cy);
    for(; e; e = e.parentElement) {
      if (e === elem)
        return true;
    }
    return false;
  JAVASCRIPT
  wait_for_jquery
  wait_until {@browser.execute_script(is_in_viewport) == true}
end
