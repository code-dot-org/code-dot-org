module MatchHelpers
  def generate_match_drag_code(answer, slot)
    "var answerElement = #{answer};" \
    "var slotElement = #{slot};" \
    "var answerRect = answerElement.getBoundingClientRect();" \
    "var startX = answerRect.left + answerRect.width / 2;" \
    "var startY = answerRect.top + answerRect.height / 2;" \
    "var slotRect = slotElement.getBoundingClientRect();" \
    "var endX = slotRect.left + slotRect.width / 2;" \
    "var endY = slotRect.top + slotRect.height / 2;" \
    "function createAndDispatchEvent(element, eventType, clientX, clientY) {" \
      "const event = new MouseEvent(eventType, {" \
        "bubbles: true, cancelable: true, view: window," \
        "clientX: clientX, clientY: clientY" \
      "});" \
      "element.dispatchEvent(event);" \
    "}" \
    "createAndDispatchEvent(answerElement, 'mousedown', startX, startY);" \
    "createAndDispatchEvent(document, 'mousemove', endX, endY);" \
    "createAndDispatchEvent(document, 'mouseup', endX, endY);"
  end
end

World(MatchHelpers)
