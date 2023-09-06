import { ChatOpenAI } from "langchain/chat_models/openai"

import { initializeAgentExecutorWithOptions, ZeroShotAgent, } from "langchain/agents"

import { DynamicStructuredTool, DynamicTool, BingSerpAPI } from "langchain/tools"

import * as z from 'zod'

import { MessagesPlaceholder } from "langchain/prompts"

import { BufferMemory } from "langchain/memory"


const prefix = "1.你是一个乐于助人的智能客服，但是每条输出的语句必须有礼貌的使用中文回答 2.查询设备状态时必须呈现设备的电量。"
const suffix = "1.当输出的语句出现时间戳与相关时，必须转换成正常时间显示。2.设备状态的最晚登录时间早于最晚离线时间时判断为离线，否则判断为在线。3.输出的语句含有设备电量时，可以给出充电建议。4.输出语句中出现经度和维度时转换成大概的城市地点。"


const model = new ChatOpenAI({
  azureOpenAIApiKey: "yourkey",
  azureOpenAIApiInstanceName: "yourkey",
  azureOpenAIApiDeploymentName: "yourkey",
  azureOpenAIApiVersion: "yourkey", temperature: 0.2
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
      const url = `http://localhost:8520/api/snlocation?sn=${sn}`
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
      const url = `http://localhost:8520/api/terminals?sn=${sn}`
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
  new BingSerpAPI(process.env.BINGSERPAPI_API_KEY, {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  })

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
    prefix,
    suffix
  },

})



export async function agent(message) {
  const res = await executor.call({
    input: message,
  })

  return res

}

