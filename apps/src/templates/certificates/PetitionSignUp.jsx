import React from 'react';

export default function PetitionSignUp() {
  return (
    <>
      <div id="petition-block" style={styles.block}>
        <h1 id="petition-message" style={styles.message}>
          "Every student in every school should have the opportunity to learn
          computer science"
        </h1>
      </div>
    </>
  );
}

const styles = {
  block: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '10px 0px',
    display: 'block'
  },
  message: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'rgb(91,103,112)',
    fontSize: '22px',
    lineHeight: '28px'
  }
};
