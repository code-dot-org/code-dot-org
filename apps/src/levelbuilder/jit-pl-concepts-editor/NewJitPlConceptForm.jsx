import React, {useState} from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

const NewJitPlConceptForm = () => {
  const [textContent, setTextContent] = useState('');

  return (
    <form action="/jit_pl_concepts" method="post">
      <RailsAuthenticityToken />
      <h1>New JIT PL Concept</h1>
      <label style={styles.label}>
        Name
        <input className="input" name="name" style={styles.input} />
      </label>
      <label style={styles.label}>
        Display Name
        <input className="input" name="display_name" style={styles.input} />
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

const styles = {
  label: {
    marginBottom: 20,
  },
  input: {
    marginLeft: 10,
  },
};

export default NewJitPlConceptForm;
