import React from 'react';
import PetitionForm from './PetitionForm';
import i18n from '@cdo/locale';

export default function PetitionCallToAction(props) {
  return (
    <>
      <div id="petition-block" className="petition-block">
        <h1 id="petition-message" className="petition-message">
          {i18n.petitionMessage()}
        </h1>
        <h2 id="sign-message" className="petition-sign-message">
          {i18n.petitionSignMessage()}
        </h2>
        <PetitionForm {...props} />
      </div>
    </>
  );
}
