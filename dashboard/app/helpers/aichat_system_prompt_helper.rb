module AichatSystemPromptHelper
  OPENAI_SAFETY_SYSTEM_PROMPT =
    {
      'simple' => 'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
      'few_shot' => '' # https://docs.google.com/document/d/1MkLLVefWTALBfiIr8is6qib76MLHA8qfEJsYi22Jan0/edit
    }
  def self.get_system_prompt(system_prompt_option)
    OPENAI_SAFETY_SYSTEM_PROMPT[system_prompt_option]
  end
end
