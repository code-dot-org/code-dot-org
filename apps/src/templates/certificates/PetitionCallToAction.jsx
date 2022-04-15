import React from 'react';
import PetitionForm from './PetitionForm';

export default function PetitionCallToAction() {
  return (
    <>
      <div id="petition-block" style={styles.block}>
        <h1 id="petition-message" className="petition_message">
          Every student in every school should have the opportunity to learn
          computer science
        </h1>
        <h2 id="sign-message" style={styles.sign}>
          If you agree, sign your name and join our mailing list.
        </h2>
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
  sign: {
    flex: '1 100%',
    fontFamily: '"Gotham 4r", sans-serif',
    color: 'rgb(91,103,112)',
    fontSize: '18px',
    lineHeight: '20px',
    margin: '10px 0px 10px 0px'
  }
};
