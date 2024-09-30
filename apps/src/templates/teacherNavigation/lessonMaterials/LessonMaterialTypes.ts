export type Lesson = {
  name: string;
  id: number;
  position: number;
  lessonPlanHtmlUrl: string;
  standardsUrl: string;
  vocabularyUrl: string;
  resources: {
    Teacher: Resource[];
    Student: Resource[];
  };
};

export type Resource = {
  key: string;
  name: string;
  url: string;
  downloadUrl?: string;
  audience: string;
  type: string;
};
