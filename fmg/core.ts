import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { Annotation, Command, interrupt, MessagesAnnotation, messagesStateReducer } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableConfig } from "@langchain/core/runnables";
import { renderTemplate } from "./prompt";

export const NamedMessages = Annotation.Root({
  jodi: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => []
  }),
  lastAgent: Annotation<string>({
    reducer: (x, y) => y,
  })
})

export type GraphState = typeof NamedMessages.State


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  maxRetries: 3,
});


export async function Jodi(state: GraphState, config?: RunnableConfig) {
  const name = "Jodi"
  const prompt = await renderTemplate(name, {})
  const msgs: BaseMessage[] = []
  if (state.jodi.length < 2 && prompt) {
    msgs.push(new AIMessage({ content: prompt }))
  }
  const resp = await llm.invoke(msgs, config)

  msgs.push(resp)
  return { jodi: msgs, lastAgent: name }
}


export function Human(state: GraphState, config?: RunnableConfig): Command {
  const userInput: string = interrupt("ready for user input")

  if (!state.lastAgent) {
    throw new Error("Could not determine the active agent.")
  }

  return new Command({
    goto: state.lastAgent,
    update: {
      [state.lastAgent]: [
        {
          "role": "human",
          "content": userInput,
        }
      ]
    }
  });
}
