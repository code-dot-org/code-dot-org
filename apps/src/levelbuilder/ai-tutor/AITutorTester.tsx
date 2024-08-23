import Papa from 'papaparse';
import React, {useEffect, useState} from 'react';

import {
  postAichatCheckSafety,
  postAichatCompletionMessage,
} from '@cdo/apps/aichat/aichatApi';
import {ChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {formatQuestionForAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import AITutorTesterSampleColumns from './AITutorTesterSampleColumns';
import {
  availableEndpoints,
  DEFAULT_TEMPERATURE,
  genAIEndpointIds,
  modelCardInfo,
} from './constants';
import {Endpoint} from './types';

import styles from './ai-tutor-tester.module.scss';

/**
 * Renders a series of buttons that allow levelbuilders to upload a CSV of
 * student inputs and get back AI responses in bulk.
 */

interface AIInteraction {
  studentInput: string;
  systemPrompt?: string | undefined;
  levelId?: number | undefined;
  temperature?: number | undefined;
  aiResponse: string | undefined;
}

interface AITutorTesterProps {
  allowed: boolean;
}

const AITutorTester: React.FC<AITutorTesterProps> = ({allowed}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [data, setData] = useState<AIInteraction[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<Endpoint>('ai-tutor');
  const [responseCount, setResponseCount] = useState<number>(0);
  const [responsesPending, setResponsesPending] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<AIInteraction>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const onDropdownChange = (value: Endpoint) => {
    setSelectedEndpoint(value);
  };

  const updateData = (result: {data: AIInteraction[]}) => {
    setData(result.data);
  };

  const getAIResponses = async () => {
    setResponsesPending(true);
    const responsePromises = data.map(async row => {
      if (selectedEndpoint === 'llm-guard') {
        return getLLMGuardToxicity(row);
      } else if (
        genAIEndpointIds.includes(
          selectedEndpoint as ValueOf<typeof AiChatModelIds>
        )
      ) {
        return getGenAIResponses(row);
      } else {
        return askAITutor(row);
      }
    });

    await Promise.allSettled(responsePromises);
  };

  const getGenAIResponses = async (row: AIInteraction) => {
    const systemPrompt = row.systemPrompt ? row.systemPrompt : '';
    const chatMessage: ChatMessage = {
      chatMessageText: row.studentInput,
      role: Role.USER,
      status: 'ok',
      timestamp: new Date().getTime(),
    };
    const temperature = row.temperature ? row.temperature : DEFAULT_TEMPERATURE;
    const aiCustomizations = {
      selectedModelId: selectedEndpoint as ValueOf<typeof AiChatModelIds>,
      temperature: temperature,
      systemPrompt: systemPrompt,
      retrievalContexts: [],
      modelCardInfo: modelCardInfo,
    };
    const levelId = row.levelId ? row.levelId : null;
    const aichatContext = {
      currentLevelId: levelId,
      scriptId: null,
      channelId: undefined,
    };
    const genAIResponse = await postAichatCompletionMessage(
      chatMessage,
      [],
      aiCustomizations,
      aichatContext
    );
    row.aiResponse = genAIResponse?.messages[1]?.chatMessageText;
    setResponseCount(prevResponseCount => prevResponseCount + 1);
  };

  const getLLMGuardToxicity = async (row: AIInteraction) => {
    const llmGuardResponse = await postAichatCheckSafety(row.studentInput);
    if (llmGuardResponse.result.statusCode === 200) {
      row.aiResponse = 'ok';
    } else if (llmGuardResponse.result.statusCode === 422) {
      row.aiResponse = 'toxic';
    } else {
      row.aiResponse = 'error';
    }
    setResponseCount(prevResponseCount => prevResponseCount + 1);
  };

  const askAITutor = async (row: AIInteraction) => {
    const chatApiResponse = await getChatCompletionMessage(
      formatQuestionForAITutor(row),
      [],
      row.systemPrompt,
      row.levelId
    );
    row.aiResponse = chatApiResponse.assistantResponse;
    setResponseCount(prevResponseCount => prevResponseCount + 1);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'ai_tutor_responses.csv');
    tempLink.click();
  };

  const csvSelected = !!csvFile;
  const dataUploaded = data.length !== 0;
  const aiResponded = dataUploaded && data.length === responseCount;

  useEffect(() => {
    if (aiResponded) {
      setResponsesPending(false);
    }
  }, [aiResponded]);

  return (
    <div>
      <h2>Generate AI Responses</h2>
      {!allowed && (
        <h3 className={styles.denied}>
          You need to be a levelbuilder with AI Tutor access to use this tool.
        </h3>
      )}
      <p>
        Upload a CSV of student inputs that will be sent to the selected
        service. AI responses will then be saved and you can download the
        resulting updated CSV.
      </p>
      <br />
      <SimpleDropdown
        labelText="Choose an endpoint"
        isLabelVisible={false}
        onChange={event => onDropdownChange(event.target.value as Endpoint)}
        items={availableEndpoints.map(endpoint => {
          return {value: endpoint.id, text: endpoint.name};
        })}
        selectedValue={selectedEndpoint}
        name="aiChatTesterDropdown"
        size="s"
      />
      <br />
      <br />
      <AITutorTesterSampleColumns endpoint={selectedEndpoint} />
      <div>
        <div className={styles.buttonSpacing}>
          <input
            className="csv-input"
            type="file"
            name="file"
            onChange={handleChange}
            disabled={!allowed}
          />
        </div>

        <div className={styles.buttonSpacing}>
          <Button
            text="Upload"
            onClick={importCSV}
            disabled={!csvSelected || !allowed}
          />
        </div>

        <div className={styles.buttonSpacing}>
          <Button
            text="Get Responses"
            onClick={getAIResponses}
            disabled={!dataUploaded || !allowed}
            isPending={responsesPending}
          />
          <span>
            {responseCount} of {data.length}
          </span>
        </div>

        <div>
          <Button
            text="Download CSV"
            onClick={downloadCSV}
            disabled={!aiResponded || !allowed}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default AITutorTester;
