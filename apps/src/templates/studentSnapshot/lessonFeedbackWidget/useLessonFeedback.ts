import {useEffect, useState, ChangeEvent} from 'react';

interface FeedbackData {
  feedbackText: string;
  recommendedActions: Array<{
    actionText: string;
    resourceName?: string;
    resourceLink?: string;
  }>;
}

interface UseLessonFeedbackProps {
  lessonId: number | null;
  studentId: number;
  teacherHasEnabledAi: boolean;
}

interface UseLessonFeedbackReturn {
  // State values
  isLoading: boolean;
  error: string | null;
  showAddResourcePopup: boolean;
  resourceLink: string;
  tempResourceLink: string;
  resourceName: string;
  tempResourceName: string;
  recommendedActionText: string;
  feedbackText: string;
  isFeedbackEdited: boolean;
  feedbackData: FeedbackData;
  // Computed values
  scrollable: boolean;
  // Handlers
  deleteResourceLink: () => void;
  handleFeedbackEdited: (newText: string) => void;
  handleRecommendedActionChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleAddResourceClick: () => void;
  handleCloseResourcePopup: () => void;
  handleTempResourceNameChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleTempResourceLinkChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  exitResourcePopup: () => void;
  handleResourceSave: () => void;
  handleSaveAsDraft: () => void;
  handleSendToStudent: () => void;
}

export const useLessonFeedback = ({
  lessonId,
  studentId,
  teacherHasEnabledAi,
}: UseLessonFeedbackProps): UseLessonFeedbackReturn => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddResourcePopup, setShowAddResourcePopup] = useState(false);
  const [resourceLink, setResourceLink] = useState('');
  const [tempResourceLink, setTempResourceLink] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [tempResourceName, setTempResourceName] = useState('');
  const [recommendedActionText, setRecommendedActionText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackEdited, setIsFeedbackEdited] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    feedbackText: '',
    recommendedActions: [
      {
        actionText: '',
        resourceName: undefined,
        resourceLink: undefined,
      },
    ],
  });

  // Effects
  useEffect(() => {
    if (!lessonId) {
      setIsLoading(true);
      setError(null);
      return;
    } else if (!teacherHasEnabledAi) {
      setError('AI Teaching Assistant is not enabled for this teacher.');
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [lessonId, teacherHasEnabledAi]);

  // Handler functions
  const deleteResourceLink = () => {
    setResourceLink('');
    setResourceName('');
  };

  const createFeedbackData = (): FeedbackData => {
    return {
      feedbackText,
      recommendedActions: [
        {
          actionText: recommendedActionText,
          resourceName: resourceName || undefined,
          resourceLink: resourceLink || undefined,
        },
      ],
    };
  };

  const exitResourcePopup = () => {
    setTempResourceName('');
    setTempResourceLink('');
    setShowAddResourcePopup(false);
  };

  const handleFeedbackEdited = (newText: string) => {
    setFeedbackText(newText);
    setIsFeedbackEdited(true);
  };

  const handleRecommendedActionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecommendedActionText(e.target.value);
  };

  const handleAddResourceClick = () => {
    setShowAddResourcePopup(true);
  };

  const handleCloseResourcePopup = () => {
    setShowAddResourcePopup(false);
  };

  const handleTempResourceNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempResourceName(e.target.value);
  };

  const handleTempResourceLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTempResourceLink(e.target.value);
  };

  const handleResourceSave = () => {
    setResourceName(tempResourceName);
    setResourceLink(tempResourceLink);
    exitResourcePopup();
  };

  const handleSaveAsDraft = () => {
    setFeedbackData(createFeedbackData());
    // TODO: Send to backend as draft
  };

  const handleSendToStudent = () => {
    setFeedbackData(createFeedbackData());
    // TODO: Send to backend as final
  };

  // Return all state and handlers needed by the component
  return {
    // State values
    isLoading,
    error,
    showAddResourcePopup,
    resourceLink,
    tempResourceLink,
    resourceName,
    tempResourceName,
    recommendedActionText,
    feedbackText,
    isFeedbackEdited,
    feedbackData,
    // Computed values
    scrollable: !error,
    // Handlers
    deleteResourceLink,
    handleFeedbackEdited,
    handleRecommendedActionChange,
    handleAddResourceClick,
    handleCloseResourcePopup,
    handleTempResourceNameChange,
    handleTempResourceLinkChange,
    exitResourcePopup,
    handleResourceSave,
    handleSaveAsDraft,
    handleSendToStudent,
  };
};

export type {FeedbackData, UseLessonFeedbackReturn};
