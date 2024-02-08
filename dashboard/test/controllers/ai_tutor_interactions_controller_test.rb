require 'test_helper'

class AiTutorInteractionsControllerTest < ActionController::TestCase
    setup do
        @student_with_ai_tutor_access = create :student_with_ai_tutor_access
        @student = create :student
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

    test "student without access tries to create AI Tutor Interaction" do
        sign_in @student
        assert_does_not_create(AiTutorInteraction) do
            post :create, params: {
                level_id: 5678,
                script_id: 246,
                type: "general_chat",
                prompt: "Can you help me?",
                status: "ok",
                ai_response: "Yes, I can help."
            }
        end
        assert_response :forbidden
    end

    test "create AI Tutor Interaction with invalid type param" do
        sign_in @student_with_ai_tutor_access 
        assert_does_not_create(AiTutorInteraction) do
            post :create, params: {
                level_id: 1234,
                script_id: 987,
                type: "trash can",
                prompt: "Can you help me?",
                status: "ok",
                ai_response: "Yes, I can help."
            }
        end
        assert_includes(@response.body, "There was an error creating a new AiTutorInteraction.") 
    end

    test "create AI Tutor Interaction with invalid status param" do
        sign_in @student_with_ai_tutor_access 
        assert_does_not_create(AiTutorInteraction) do
            post :create, params: {
                level_id: 1234,
                script_id: 987,
                type: "trash can",
                prompt: "Can you help me?",
                status: "hot mess",
                ai_response: "Yes, I can help."
            }
        end
        assert_includes(@response.body, "There was an error creating a new AiTutorInteraction.") 
    end


end