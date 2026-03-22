export type QuizOptionDto = {
  id: string;
  label: string;
};

export type QuizQuestionDto = {
  id: string;
  prompt: string;
  responseType: "multiple_choice" | "short_answer";
  options: QuizOptionDto[];
  autoGrade: boolean;
};
