import React, {useState} from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

import moduleStyles from './jitPlConceptsEditor.module.scss';

const NewJitPlConceptForm = () => {
  const [textContent, setTextContent] = useState('');

  return (
    <form action="/jit_pl_concepts" method="post">
      <RailsAuthenticityToken />
      <h1>New JIT PL Concept</h1>
      <label className={moduleStyles.conceptLabel}>
        Name
        <input name="name" className={moduleStyles.conceptInput} />
      </label>
      <label className={moduleStyles.conceptLabel}>
        Display Name
        <input name="display_name" className={moduleStyles.conceptInput} />
      </label>
      <TextareaWithMarkdownPreview
        name="text_content"
        label="Text Content"
        handleMarkdownChange={e => setTextContent(e.target.value)}
        markdown={textContent || ''}
      />
      <br />
      <button className="btn btn-primary" type="submit">
        Save Changes
      </button>
    </form>
  );
};

export default NewJitPlConceptForm;
