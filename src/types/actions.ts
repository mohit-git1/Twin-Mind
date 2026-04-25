export type ActionItem = {
  id: string
  text: string
  suggestedTask: string
  timing: "today" | "later"
  confidence: number
  type: "task" | "goal"
}
