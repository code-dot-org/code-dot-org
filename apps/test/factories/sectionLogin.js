export const sectionLoginFactory = {
  id: 1,
  build(attrs) {
    const id = this.id++;
    return {
      id,
      username: `student${id}`,
      name: 'Student',
      userType: 'student',
      age: 13,
      gender: 'f',
      loginType: 'email',
      secretWords: 'wizard',
      secretPictureName: 'wizard',
      secretPictureUrl: '/wizard.jpg',
      sharingDisabled: true,
      ...attrs,
    };
  },
};
