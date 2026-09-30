export interface Question {
  id: number;
  question: string;
  options: string[];
  /** índice 0-3 de la opción correcta */
  correctAnswer: number;
  explanation?: string;
  /** feedback por opción (4 textos, uno por cada opción) */
  feedback?: string[];
}

export interface QuizResult {
  questions: Question[];
}

export interface GenerateRequest {
  text: string;
  instructions?: string;
  numQuestions?: number;
}
