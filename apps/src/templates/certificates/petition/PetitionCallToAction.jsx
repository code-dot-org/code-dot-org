import React from 'react';
import PetitionForm from './PetitionForm';
import i18n from '@cdo/locale';
import style from '../../../../style/code-studio/petition-call-to-action.module.scss';

const PetitionCallToAction = props => (
  <>
    <div id="petition-block" className={style['petition-block']}>
      <h1 id="petition-message" className={style['petition-message']}>
        {i18n.petitionMessage()}
      </h1>
      <h2 id="sign-message" className={style['petition-sign-message']}>
        {i18n.petitionSignMessage()}
      </h2>
      <PetitionForm {...props} style={style} />
    </div>
  </>
);

export default PetitionCallToAction;
