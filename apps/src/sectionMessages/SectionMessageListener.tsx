import {createConsumer} from '@rails/actioncable';
import React from 'react';

import SectionMessagePopup, {SectionMessageData} from './SectionMessagePopup';

interface IncomingPayload {
  type?: string;
  section_id?: number;
  section_name?: string;
  teacher_name?: string;
  message?: string;
  link?: string | null;
  sent_at?: string;
}

// Subscribes to SectionMessageChannel and renders the most recent message as a
// popup. If a new message arrives while one is on screen, the new one
// replaces it — teachers tend to send these as a "stop and look here" signal
// so freshest wins.
const SectionMessageListener: React.FC = () => {
  const [current, setCurrent] = React.useState<SectionMessageData | null>(null);

  React.useEffect(() => {
    let subscription: {unsubscribe: () => void} | null = null;
    let consumer: ReturnType<typeof createConsumer> | null = null;
    try {
      consumer = createConsumer();
      subscription = consumer.subscriptions.create('SectionMessageChannel', {
        received(data: IncomingPayload) {
          if (data?.type !== 'section_message' || !data.message) return;
          setCurrent({
            section_id: data.section_id ?? 0,
            section_name: data.section_name,
            teacher_name: data.teacher_name,
            message: data.message,
            link: data.link ?? null,
            sent_at: data.sent_at,
          });
        },
      });
    } catch (err) {
      // ActionCable connect can fail in environments without a /cable mount
      // (e.g. some test pages). Silent: the feature is non-essential.
      console.error('SectionMessageListener: subscription failed', err);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (!current) {
    return null;
  }
  return (
    <SectionMessagePopup data={current} onClose={() => setCurrent(null)} />
  );
};

export default SectionMessageListener;
