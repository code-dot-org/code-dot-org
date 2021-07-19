import {gql, makeVar, useMutation, useReactiveVar} from '@apollo/client';
import {pick} from 'lodash';
import {makeEnum} from '@cdo/apps/utils';

export const StudentInputField = makeEnum('name', 'age', 'gender');

export const manageStudentsTypePolicies = {
  User: {
    fields: {
      isEditing: {
        read(_, {readField}) {
          const studentId = readField('id');
          return !!editingStudentInputsVar()[studentId];
        }
      }
    }
  },
  // it turns out that if we query for data that is already in our cache using
  // a different query from the one that put it there, Apollo doesn't know that
  // it's there and so goes straight to the server. e.g. querying for section
  // by id then subsequently asking for one of the students in the section
  // by querying for user by id results in a network request. the type policy below
  // tells Apollo that when it sees a `user` field in a query, it should attempt
  // to return a reference from the cache before hitting the network.
  //
  // i find it a little strange that this isn't the default behavior. however,
  // from what i've read about query batching, it sounds like the correct way to
  // do a "container" query followed by smaller queries in leaf components
  // (e.g. whole section followed by individual students) is to export the smaller
  // queries as fragments and compose the container query out of those. so if we
  // were doing that, the smaller queries would be identical to portions of the
  // container query and would therefore know to look in the cache.
  //
  // FWIW this functionality is no longer needed by my implementation, but i'm
  // leaving it here as a record of my learnings.
  //
  // -CF
  Query: {
    fields: {
      user(_, {args, toReference}) {
        return toReference({
          __typename: 'User',
          id: args.id
        });
      }
    }
  }
};

export const useEditStudent = student => {
  const studentInputVar = editingStudentInputsVar()[student.id];
  const studentInput = useReactiveVar(studentInputVar);

  const [save, {error: saveError, loading: isSaving}] = useMutation(
    UPDATE_STUDENT_MUTATION,
    {
      variables: {
        id: student.id,
        input: studentInput
      },
      onCompleted(_) {
        setIsEditingStudent(student, false);
      }
    }
  );

  const cancel = () => setIsEditingStudent(student, false);

  const update = (field, value) =>
    studentInputVar({...studentInput, [field]: value});

  return {
    student,
    studentInput,
    cancel,
    update,
    save,
    isSaving,
    saveError
  };
};

const UPDATE_STUDENT_MUTATION = gql`
  mutation StudentMutation($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      user {
        id
        age
        gender
        name
      }
    }
  }
`;

export const editingStudentInputsVar = makeVar({});

export const setIsEditingStudent = (student, isEditing) => {
  editingStudentInputsVar({
    ...editingStudentInputsVar(),
    [student.id]: isEditing ? createStudentUserInput(student) : null
  });
};

export const editAll = students => {
  students.forEach(student => {
    if (!student.isEditing) {
      setIsEditingStudent(student, true);
    }
  });
};

export const saveAll = (students, client) => {
  students.forEach(student => {
    if (student.isEditing) {
      const studentInput = editingStudentInputsVar()[student.id]();
      client
        .mutate({
          mutation: UPDATE_STUDENT_MUTATION,
          variables: {
            id: student.id,
            input: studentInput
          }
        })
        .then(setIsEditingStudent(student, false));
    }
  });
};

/**
 * we could use a regular object for student input instead of a reactive var,
 * but then we would have to pass the whole `editingStudentInputsVar` into
 * `useReactiveVar` in our `useEditStudent` hook, which would cause all
 * `WriteRow`s to re-render whenever we update a value on one.
 */
const createStudentUserInput = student =>
  makeVar(pick(student, Object.keys(StudentInputField)));
