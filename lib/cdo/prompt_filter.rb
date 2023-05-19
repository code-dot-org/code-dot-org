require 'cdo/open_ai'

module PromptFilter
  def self.find_potential_content_violations(student_prompt)
    system_prompt = "Your kindergarten students are using DALL-E, using prompts to generate images for their projects. One of the students has submitted this prompt: ```{student_prompt}```

    Review this prompt against the following areas:

      1. Discriminatory Graphics or Comments
      2. Violence
        a. This includes any weapons, even if harmless - or anything that could be used as a weapon.
        b. This also includes the aftermath of violence, such as death or injuries.
      3. Personal Identifiable Information
        a. This includes email addresses, names, or mailing addresses
      4. Sexual or Nudity
        a. This includes any sayings that could be interpreted as sexual in nature.
      5. Curse Words
      6. Suicidal or Self-harm
      7. Cyberbullying
      8. Drug References
        a. This includes legal and illegal substances.
        b. This also covers drinking, smoking, or any other recreational activities.
      9. Potential Copyright Infringement
      10. Extreme Ideals

      If the contents of the prompt fits into any of these areas return 1, otherwise return 0."

    response = OpenAI.gpt(system_prompt, student_prompt)

    case response
    when "0"
      return 200
    when "1"
      raise Exception.new("Invalid prompt: contains offensive content")
    else
      raise Exception.new("Unexpected response from OpenAI")
    end
  end
end
