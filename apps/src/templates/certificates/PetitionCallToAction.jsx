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
        <h2 id="sign-message" className="petition_sign_message">
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
  }
};
