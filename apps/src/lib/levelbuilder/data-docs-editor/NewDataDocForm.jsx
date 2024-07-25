import React, {useState} from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

const NewDataDocForm = () => {
  const [dataDocContent, setDataDocContent] = useState('');

  return (
    <form action="/data_docs" method="post">
      <RailsAuthenticityToken />
      <h1>New Data Doc</h1>
      <label style={styles.label}>
        Slug
        <input className="input" name="key" required style={styles.input} />
        <HelpTip style={styles.helptip}>
          <p>
            The data doc slug is used in URLs and cannot be updated once set. A
            slug can only contain lowercase letters, numbers, and dashes, and
            'new' and 'edit' are reserved.
          </p>
        </HelpTip>
      </label>
      <label style={styles.label}>
        Name
        <input className="input" name="name" style={styles.input} />
      </label>
      <TextareaWithMarkdownPreview
        name="content"
        label="Content"
        handleMarkdownChange={e => setDataDocContent(e.target.value)}
        markdown={dataDocContent || ''}
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
  helptip: {
    marginLeft: 10,
  },
};

export default NewDataDocForm;
