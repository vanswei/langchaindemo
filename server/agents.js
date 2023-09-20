import { ChatOpenAI } from "langchain/chat_models/openai"

import { initializeAgentExecutorWithOptions } from "langchain/agents"

import { DynamicStructuredTool } from "langchain/tools"

import * as z from 'zod'

import { MessagesPlaceholder } from "langchain/prompts"

import { BufferMemory } from "langchain/memory"


import { Client } from "langsmith"
import { LangChainTracer } from "langchain/callbacks"

const client = new Client({
  apiUrl: "https://api.smith.langchain.com",
  apiKey: "yourkey"
});

const tracer = new LangChainTracer({
  projectName: "your projectname",
  client
})

const model = new ChatOpenAI({
  azureOpenAIApiKey: "yourkey",
  azureOpenAIApiInstanceName: "yourkey",
  azureOpenAIApiDeploymentName: "yourkey",
  azureOpenAIApiVersion: "yourkey", temperature: 0
});

const tools = [


  new DynamicStructuredTool({

    name: "sn设备位置查询",
    description: "输入设备的sn,查找设备定位",
    schema: z.object({
      sn: z.string()
    }),
    func: async function (options) {
      const { sn } = options
      const url = `http://localhost:8520/api/get-location?sn=${sn}`
      const response = await fetch(url)
      const data = await response.json()
      const dataString = JSON.stringify(data)
      return dataString
    },
  }),

  new DynamicStructuredTool({

    name: "sn设备状态查询",
    description: "输入设备的sn,查询设备状态",
    schema: z.object({
      sn: z.string()
    }),
    func: async function (options) {
      const { sn } = options
      const url = `http://localhost:8520/api/state?sn=${sn}`
      const response = await fetch(url)
      const data = await response.json()
      const dataString = JSON.stringify(data)
      return dataString
    },
  }),



  new DynamicStructuredTool({

    name: "车辆设备查询",
    description: "输入车辆车牌号,车辆位置",
    schema: z.object({
      carNumber: z.string()
    }),
    func: async function (options) {
      const { carNumber } = options
      const url = `http://localhost:8520/api/carState?carNumber=${carNumber}`
      const response = await fetch(url)
      const data = await response.json()
      const dataString = JSON.stringify(data)
      return dataString
    },
  }),

]



const executor = await initializeAgentExecutorWithOptions(tools, model, {

  agentType: "structured-chat-zero-shot-react-description",
  verbose: true,
  memory: new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
  }),
  agentArgs: {
    inputVariables: ["input", "agent_scratchpad", "chat_history"],
    memoryPrompts: [new MessagesPlaceholder("chat_history")],
  },

})






export async function agent(message) {

  const res = await executor.invoke({
    input: message, timeout: 10000, callbacks: [tracer],
  })

  return res

}




