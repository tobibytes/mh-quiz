export const QUIZ_TYPES = ["know_morganhacks", "throwback"] as const;
export const QUIZ_STATUSES = ["scheduled", "active", "archived"] as const;
export const RESPONSE_TYPES = ["multiple_choice", "short_answer"] as const;

export type QuizType = (typeof QUIZ_TYPES)[number];
export type QuizStatus = (typeof QUIZ_STATUSES)[number];
export type ResponseType = (typeof RESPONSE_TYPES)[number];
