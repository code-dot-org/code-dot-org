module AidiffPromptHelper
  include AiDiffBedrockHelper

  EXIT_TICKET_SCHEMA = {
    "type" => "object",
    "required" => ["comment", "exit_ticket_items"],
    "properties" => {
      "comment" => {
        "type" => "string",
        "description" => "Your chat comment to the teacher addressing their question and introducing the exit_ticket content"
      },
      "exit_ticket_items" => {
        "type" => "array",
        "required" => ["question", "type", "answer"],
        "items" => {
          "type" => "object",
          "properties" => {
            "question" => {
              "type" => "string",
              "description" => "One exit ticket question for the students. This should be markdown formatted. If it is multiple choice, it must include lettered answer options"
            },
            "type" => {
              "type" => "string",
              "enum" => ["short_answer", "multiple_choice", "free_response"],
              "description" => "The type of question this is, either short answer, multiple choice, or free response"
            },
            "answer" => {
              "type" => "string",
              "description" => "The correct answer to this question, or for free response, a bulleted list of elements an answer should have"
            }
          }
        }
      }
    }
  }

  LESSON_HOOK_SCHEMA = {
    "type" => "object",
    "required" => ["comment", "lesson_hook"],
    "properties" => {
      "comment" => {
        "type" => "string",
        "description" => "Your chat comment to the teacher addressing their question and introducing the lesson hook content to the teacher."
      },
      "lesson_hook" => {
        "type" => "object",
        "required" => ["introduction", "activity", "wrap_up"],
        "description"=> "The lesson hook content that will be shown to students. It should be age-appropriate, generate interest in the lesson, take 1-5 minutes, and geared toward student interests.",
        "properties" => {
          "introduction" => {
            "type" => "string",
              "description" => "The introduction of the lesson hook's activity to the students. It should get student attention."
          },
          "activity" =>{
            "type" => "string",
                "description" => "A short activity that engages students and frames the lesson content. This should be markdown formatted."
          },
          "wrap_up" => {
            "type" => "string",
              "description" => "A wrap-up that connects the activity they just did to the lesson content and segues into the lesson. This can include questions to think about as they start the lesson."
          }
        }
      }
    }
  }

  def get_prompt_supplement(section_contexts)
    return "" unless section_contexts
    prompt = "\nThe courses that this teacher may ask you about are:"
    section_contexts.each do |context|
      prompt = format("%{prompt}\n - %{course_name}", prompt: prompt, course_name: context[:course_display_name])
    end
    prompt
  end

  def add_exit_ticket_formatting(prompt, previous_message = nil)
    prompt = format('%{prompt}

      This teacher is asking you to produce or modify an exit ticket. An exit ticket is a short set of 1-5 questions for the end of class that checks if students understand the major points of the lesson. If the teacher requests a specific number of questions you must only generate the number of questions requested.
      If the teacher asks for a change, addition, or subtraction to the exit ticket (e.g adding or removing a question), you must combine this with the content of the previous exit ticket by repeating exactly the content of the previous exit ticket items with the change, addition, or subtraction they requested. This might change the number of questions you should generate- for example adding or subtracting to the number of questions.', prompt: prompt
      )

    if previous_message&.is_artifact_candidate
      prompt = format('%{prompt}
        Here is the previous exit ticket that you should make modifications to:

        %{previous_exit_ticket}', prompt: prompt, previous_exit_ticket: previous_message.content
        )
    end

    prompt = format('%{prompt}
      Format your response in JSON using the following schema:

      %{json_schema}

      Example response:

      {
        "comment" : "Here\'s an exit ticket that uses a multiple choice question to check understanding",
        "exit_ticket_items" : [
          {
            "question" : "What does the cow say? \n  a) moo\n  b) meow\n  c) hiss",
            "type" : "multiple_choice",
            "answer" : "a) moo"
          }
        ]
      }', prompt: prompt, json_schema: EXIT_TICKET_SCHEMA.to_json
      )
    prompt
  end

  def add_lesson_hook_formatting(prompt, previous_message = nil)
    prompt = format('%{prompt}

      This teacher is asking you to produce or modify a lesson hook. A lesson hook is a short activity or fun introduction for the beginning of class that introduces the lesson, engages students, and connects the lesson with previous lessons, student interests, or other subjects. A lesson hook should take 1-5 minutes of class time. If the teacher requests a specific lesson hook subject or activity type, you must follow their request.
      If the teacher asks for a change, addition, or subtraction to the lesson hook, you must combine this with the content of the previous lesson hook and only make the changes the teacher requested and no other changes.', prompt: prompt
      )

    if previous_message&.is_artifact_candidate
      prompt = format('%{prompt}
        Here is the previous lesson hook that you should make modifications to:

        %{previous_lesson_hook}', prompt: prompt, previous_lesson_hook: previous_message.content
        )
    end

    prompt = format('%{prompt}
      Format your response in JSON using the following schema:

      %{json_schema}

      Example response:

      {
        "comment" : "Here\'s a lesson hook that uses an activity to introduce this lesson",
        "lesson_hook" : {
            "introduction" : "Hey students! We are doing an activity called duck duck goose to learn about birds",
            "activity" : "Duck Duck Goose: sit in a circle, one person is it, if they say goose, then you chase them",
            "wrap_up" : "Think about what other birds live in the water like ducks and geese. How are they similar?"
        }
      }', prompt: prompt, json_schema: LESSON_HOOK_SCHEMA.to_json
      )
    prompt
  end

  def get_prompt_for_context(context, course_name, unit_name, lesson_name, is_preset, section_contexts, level_instructions, student_code, artifact_type, previous_message = nil)
    case context
    when SharedConstants::AI_DIFF_CONTEXT[:LEVEL]
      prompt =
        if student_code.present?
          format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

            The teacher is currently working on a level within that lesson. The instructions for this task are: %{level_instructions}

            The student code the teacher is viewing is: %{student_code}

            If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

            Here are the search results in numbered order:
            $search_results$",
            course_name:, unit_name:, lesson_name:, level_instructions:,
            # Truncate student code to 75,000 characters to stay comfortably under AWS 100,000 character limit.
            student_code: format("%.75000s", student_code[:student_code])
          )
        else
          format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

            The teacher is currently working on a level within that lesson. The instructions for this task are: %{level_instructions}

            If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

            Here are the search results in numbered order:
            $search_results$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name, level_instructions: level_instructions
          )
        end
    when SharedConstants::AI_DIFF_CONTEXT[:LESSON]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:UNIT]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the %{course_name} course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is %{course_name} %{unit_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name, unit_name: unit_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:COURSE]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the %{course_name} course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is %{course_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:PROGRESS]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the %{course_name} course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
    The current course this teacher is working on is %{course_name}. The teacher is currently viewing a page showing how much progress their students have made in this course.

    If asked about a student, here is some data in CSV format about the student progress the teacher is viewing. The column headers refer to level numbers. In the data rows, 'A' means the student attempted the work but did not finish; 'S' means the student submitted their work; 'V' means the student submitted their work and the submission has been validated for completeness or correctness; 'N' means the student has not started the work. Please do not repeat these abbreviations to the teacher as the page they are viewing uses a different, graphical method of displaying this information.

    %{progress_csvs}

    Here are the search results in numbered order:
    $search_results$", course_name: course_name, progress_csvs: progress_csv_for_all_sections(section_contexts).join("\n\n")
      )
    when SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.%{section_contexts}

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", section_contexts: get_prompt_supplement(section_contexts)
      )
    end
    if artifact_type == SharedConstants::AI_DIFF_ARTIFACT_TYPE[:EXIT_TICKET]
      prompt = add_exit_ticket_formatting(prompt, previous_message)
    end
    if artifact_type == SharedConstants::AI_DIFF_ARTIFACT_TYPE[:LESSON_HOOK]
      prompt = add_lesson_hook_formatting(prompt, previous_message)
    end
    unless is_preset || artifact_type
      prompt = format("%{prompt}

      $output_format_instructions$", prompt: prompt
      )
    end
    prompt
  end
end
