import React, {useState} from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

const NewDataDocForm = () => {
  const [dataDocContent, setDataDocContent] = useState('');

  return (
    <form action="/data_docs" method="post">
      <RailsAuthenticityToken />
      <h1>New Data Doc</h1>
      <h2>
        This feature is in progress. It is not ready for use on Levelbuilder
        yet.
      </h2>
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
    marginBottom: 20
  },
  input: {
    marginLeft: 10
  },
  helptip: {
    marginLeft: 10
  }
};

export default NewDataDocForm;
