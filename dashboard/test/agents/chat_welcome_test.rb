require 'test_helper'

class ChatWelcomeTest < ActiveSupport::TestCase
  test "execute stores message accessible via attr_reader" do
    tool = ChatWelcome.new
    tool.execute(message: "Hello, student!")
    assert_equal "Hello, student!", tool.message
  end

  test "execute overwrites a previously stored message" do
    tool = ChatWelcome.new
    tool.execute(message: "First message")
    tool.execute(message: "Second message")
    assert_equal "Second message", tool.message
  end

  test "system_prompt includes the lesson localized name" do
    lesson = stub(localized_name: "Lesson 3: Loops")
    assert_includes ChatWelcome.system_prompt(lesson), "Lesson 3: Loops"
  end

  test "system_prompt instructs agent to call the chat_welcome tool" do
    lesson = stub(localized_name: "Any Lesson")
    assert_includes ChatWelcome.system_prompt(lesson), "chat_welcome"
  end
end
