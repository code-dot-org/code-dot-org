import {ChangeEvent, useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';

export type TokenPromptProps = {
  onSubmit: (token: string | null) => void;
};
const TokenPrompt = ({onSubmit}: TokenPromptProps) => {
  const [token, setToken] = useState<string | null>(null);

  const handleTokenInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  return (
    <>
      <TextField
        onChange={handleTokenInputChange}
        name={'draft-token'}
        label={'Draft Token'}
        inputType={'password'}
      />
      <Button text={'Submit'} onClick={() => onSubmit(token)} size={'s'} />
    </>
  );
};
export default TokenPrompt;
