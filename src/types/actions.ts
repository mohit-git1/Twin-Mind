export type ActionItem = {
  text: string
  suggestedTask: string
  timing: "today" | "later"
  confidence: number
  type: "task" | "goal"
}
