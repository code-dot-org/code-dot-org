import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import React, {useState} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const TestMailJetPage: React.FunctionComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const onClickSend = async () => {
    if (isSending) {
      return;
    }
    setIsSending(true);

    try {
      const authToken = await getAuthenticityToken();
      const response = await fetch('/users/send_test_mailjet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': authToken,
        },
        body: JSON.stringify({
          email: email,
          name: name,
        }),
      });

      if (response.ok) {
        console.log('RESPONSE OK');
      } else {
        const validationErrors = await response.json();
        console.log(`RESPONSE ERROR: ${JSON.stringify(validationErrors)}`);
      }
    } catch (error) {
      console.log(`FETCH ERROR: ${JSON.stringify(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main>
      <div>
        <TextField
          name="name"
          label="Name (contact firstname and displayname)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          name="email"
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br />
        <br />
        <Button
          text="Send email"
          type="primary"
          onClick={onClickSend}
          isPending={isSending}
        />
      </div>
    </main>
  );
};

export default TestMailJetPage;
