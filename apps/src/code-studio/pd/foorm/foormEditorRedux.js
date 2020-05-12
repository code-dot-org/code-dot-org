const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
export const setFormQuestions = formQuestions => ({
  type: SET_FORM_QUESTIONS,
  formQuestions
});

const initialState = {
  foormQuestions: {}
};

export default function formQuestions(state = initialState, action) {
  //console.log('in formQuestions action');
  if (action.type === SET_FORM_QUESTIONS) {
    // console.log(
    //   action.formQuestions
    // );
    return {
      formQuestions: action.formQuestions
    };
  }

  return state;
}
