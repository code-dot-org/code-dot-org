import React from 'react';
import PetitionForm from './PetitionForm';

export default function PetitionCallToAction() {
  return (
    <>
      <div id="petition-block" className="petition-block">
        <h1 id="petition-message" className="petition-message">
          Every student in every school should have the opportunity to learn
          computer science
        </h1>
        <h2 id="sign-message" className="petition-sign-message">
          If you agree, sign your name and join our mailing list.
        </h2>
        <PetitionForm />
      </div>
    </>
  );
}
