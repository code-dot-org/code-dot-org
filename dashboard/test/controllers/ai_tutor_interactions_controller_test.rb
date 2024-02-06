require 'test_helper'

class AiTutorInteractionsControllerTest < ActionController::TestCase
    setup do
        @student_with_ai_tutor_access = create :student_with_ai_tutor_access
    end

    test "create AI Tutor Interaction with valid params" do
        sign_in @student_with_ai_tutor_access 
        assert_creates(AiTutorInteraction) do
            post :create, params: {
                level_id: 1234,
                script_id: 987,
                type: "general_chat",
                prompt: "Can you help me?",
                status: "ok",
                ai_response: "Yes, I can help."
            }
        end
    end
end