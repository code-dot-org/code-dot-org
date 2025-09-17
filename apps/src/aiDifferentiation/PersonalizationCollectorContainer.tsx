import Button from '@code-dot-org/component-library/button';
import React from 'react';

import i18n from '@cdo/locale';

import {
  NumberOfYearsTeachingAnswer,
  ClassroomVisionAnswer,
  ChallengeAnswer,
  ConfidenceAnswer,
  GoalsAnswer,
  SupportAnswer,
} from './PersonalizationAnswers';
import PersonalizationQuestion from './PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './personalization-information.module.scss';

interface PersonalizationData {
  selectedGoals: string[];
  selectedSupports: string[];
  otherSupportText: string;
  otherGoalText: string;
  selectedConfidence: number;
  yearsTeaching: number;
  dateYearsTeachingSet: Date | null;
  classroomVision: string;
  challenge: string;
}

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);
  const [personalizationData, setPersonalizationData] =
    React.useState<PersonalizationData>({
      selectedGoals: [],
      selectedSupports: [],
      otherSupportText: '',
      otherGoalText: '',
      selectedConfidence: -1,
      yearsTeaching: 0,
      dateYearsTeachingSet: null,
      classroomVision: '',
      challenge: '',
    });

  const NEXT = 1;
  const BACK = -1;

  const onCarouselPress = (direction: number) => {
    if (direction === NEXT && questionsNumber === 0) {
      setPersonalizationData(prev => ({
        ...prev,
        dateYearsTeachingSet: new Date(),
      }));
    }

    if (
      (direction === BACK && questionsNumber === 0) ||
      (direction === NEXT &&
        questionsNumber === PERSONALIZATION_PROMPTS.length - 1)
    ) {
      return;
    }
    setQuestionsNumber(questionsNumber + direction);
  };

  const determineAnswerType = React.useCallback(() => {
    const currentQuestion = PERSONALIZATION_PROMPTS[questionsNumber];
    switch (currentQuestion.order) {
      case 1:
        return (
          <NumberOfYearsTeachingAnswer
            yearsTeaching={personalizationData.yearsTeaching}
            setYearsTeaching={(years: number) =>
              setPersonalizationData(prev => ({
                ...prev,
                yearsTeaching: years,
              }))
            }
          />
        );
      case 2:
        return (
          <ConfidenceAnswer
            selectedConfidence={personalizationData.selectedConfidence}
            setSelectedConfidence={(confidence: number) =>
              setPersonalizationData(prev => ({
                ...prev,
                selectedConfidence: confidence,
              }))
            }
          />
        );
      case 3:
        return (
          <GoalsAnswer
            selectedGoals={personalizationData.selectedGoals}
            setSelectedGoals={(goals: string[]) =>
              setPersonalizationData(prev => ({...prev, selectedGoals: goals}))
            }
            otherGoalText={personalizationData.otherGoalText}
            setOtherGoalText={(text: string) =>
              setPersonalizationData(prev => ({...prev, otherGoalText: text}))
            }
          />
        );
      case 4:
        return (
          <ClassroomVisionAnswer
            classroomVision={personalizationData.classroomVision}
            setClassroomVision={(vision: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                classroomVision: vision,
              }))
            }
          />
        );
      case 5:
        return (
          <SupportAnswer
            selectedSupports={personalizationData.selectedSupports}
            setSelectedSupports={(supports: string[]) =>
              setPersonalizationData(prev => ({
                ...prev,
                selectedSupports: supports,
              }))
            }
            otherSupportText={personalizationData.otherSupportText}
            setOtherSupportText={(text: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                otherSupportText: text,
              }))
            }
          />
        );
      case 6:
        return (
          <ChallengeAnswer
            challenge={personalizationData.challenge}
            setChallenge={(challenge: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                challenge: challenge,
              }))
            }
          />
        );
      default:
        return <div>Error: question not found</div>;
    }
  }, [questionsNumber, personalizationData]);

  return (
    <div className={style.carouselContainer}>
      <PersonalizationQuestion questionNumber={questionsNumber} />
      <div className={style.answerContainer}>{determineAnswerType()}</div>

      <div className={style.navigationButtons}>
        <Button
          id={'back-button'}
          text={i18n.back()}
          type="secondary"
          color="gray"
          size="m"
          onClick={() => onCarouselPress(BACK)}
          iconLeft={{iconName: 'angle-left'}}
        />
        <Button
          id={'next-button'}
          text={i18n.next()}
          type="primary"
          size="m"
          onClick={() => onCarouselPress(NEXT)}
          iconRight={{iconName: 'angle-right'}}
        />
      </div>
    </div>
  );
};

export default PersonalizationCollectorContainer;
