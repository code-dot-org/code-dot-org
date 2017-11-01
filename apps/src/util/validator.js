const EMAIL_RE = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const isEmail = (value) => {
  if (!value.match(EMAIL_RE)) {
    return 'Please enter a valid email address, like name@example.com';
  }
};

export {isEmail}