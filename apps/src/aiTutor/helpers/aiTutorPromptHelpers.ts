type AnswerTypeGroup<T extends string> = {
  heading: string;
  answerTypes: T[];
};

export const buildAnswerTypeRouterSection = <T extends string>(
  groups: AnswerTypeGroup<T>[],
  triggers: Record<T, string>,
  answerTypes: T[]
): string => {
  return groups
    .flatMap(group => {
      const groupAnswerTypes = group.answerTypes.filter(answerType =>
        answerTypes.includes(answerType)
      );
      if (groupAnswerTypes.length === 0) return [];
      return [
        group.heading,
        ...groupAnswerTypes.map(
          answerType => `- ${triggers[answerType].trim()}`
        ),
        '',
      ];
    })
    .join('\n');
};
