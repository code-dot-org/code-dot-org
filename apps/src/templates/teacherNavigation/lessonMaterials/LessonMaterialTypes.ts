export type Lesson = {
  name: string;
  id: number;
  position: number;
  lessonPlanHtmlUrl: string;
  standardsUrl: string;
  vocabularyUrl: string;
  resources: {
    Teacher: {
      key: string;
      name: string;
      url: string;
      downloadUrl?: string;
      audience: string;
      type: string;
    }[];
    Student: {
      key: string;
      name: string;
      url: string;
      downloadUrl?: string;
      audience: string;
      type: string;
    }[];
  };
};
