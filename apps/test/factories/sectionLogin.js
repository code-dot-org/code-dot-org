import {Factory} from 'rosie';

export const sectionLoginFactory = Factory.define('sectionLogin')
  .sequence('id')
  .sequence('username', i => `student${i}`)
  .attrs({
    name: 'Student',
    userType: 'student',
    age: 13,
    gender: 'f',
    loginType: 'email',
    secretWords: 'wizard',
    secretPictureName: 'wizard',
    secretPicturePath: '/wizard.jpg',
    sharingDisabled: true
  });
