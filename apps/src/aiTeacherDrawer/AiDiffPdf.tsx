import {Document, Page, View, Text, StyleSheet} from '@react-pdf/renderer';
import React from 'react';

import {Role} from '../aiComponentLibrary/chatMessage/types';

import {ChatItem, ChatTextMessage} from './types';

const pdfStyles = StyleSheet.create({
  page: {
    gap: 20,
    flexDirection: 'column',
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
  },
  view: {
    flexDirection: 'row',
  },
  view_user: {
    justifyContent: 'flex-end',
  },
  view_assistant: {
    justifyContent: 'flex-start',
  },
  text: {
    padding: 12,
    flexShrink: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text_user: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    backgroundColor: '#EAECEF',
  },
  text_assistant: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 8,
    backgroundColor: '#E0F8F9',
  },
});

interface AiDiffPdfProps {
  messages: ChatItem[];
}

const AiDiffPdf: React.FC<AiDiffPdfProps> = ({messages}) => {
  return (
    <Document>
      <Page style={pdfStyles.page}>
        {messages
          .filter((item): item is ChatTextMessage => 'chatMessageText' in item)
          .map((item: ChatTextMessage, id: number) => (
            <View
              style={[
                pdfStyles.view,
                item.role === Role.ASSISTANT
                  ? pdfStyles.view_assistant
                  : pdfStyles.view_user,
              ]}
              key={id}
            >
              <Text
                style={[
                  pdfStyles.text,
                  item.role === Role.ASSISTANT
                    ? pdfStyles.text_assistant
                    : pdfStyles.text_user,
                ]}
                key={id}
              >
                {item.chatMessageText}
              </Text>
            </View>
          ))}
      </Page>
    </Document>
  );
};

export default AiDiffPdf;
