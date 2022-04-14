import React from 'react';
import PetitionForm from './PetitionForm';

export default function PetitionCallToAction() {
  return (
    <>
      <div id="petition-block" style={styles.block}>
        <h1 id="petition-message" style={styles.message}>
          "Every student in every school should have the opportunity to learn
          computer science"
        </h1>
        <PetitionForm />
      </div>
    </>
  );
}

const styles = {
  block: {
    display: 'flex',
    flexFlow: 'row wrap',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '10px 0px',
    flex: '1 100%'
  },
  message: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'rgb(91,103,112)',
    fontSize: '22px',
    lineHeight: '28px'
  }
};
