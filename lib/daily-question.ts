export type DailyQuestionType = "text" | "multiple_choice"

export type DailyQuestion = {
  id: string
  question: string
  type: DailyQuestionType
  options: string[]
  reward: number
  questionDate: string
  attemptsUsed: number
  maxAttempts: number
  answeredCorrectly: boolean
  correctRespondents: number
}

export type DailyAnswerResult = {
  ok: boolean
  correct: boolean
  alreadyRewarded: boolean
  rewardEarned: number
  attemptsUsed: number
  attemptsRemaining: number
  message: string
}
