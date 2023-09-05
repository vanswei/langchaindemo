<template>
  <div>
    导航栏
    <header
      class="bg-blue-500 p-4 text-white text-xl font-bold fixed top-0 left-0 right-0 z-10"
    >
    智能客服DEMO
    </header>

    <main class="mt-16 p-4">
      <div
        class="bg-white p-4 rounded-lg shadow-lg overflow-y-scroll h-[calc(100vh-250px)]"
      >
        <template v-for="item in chatMessages">
          <!-- 用户聊天气泡 -->
          <div
            v-if="item.type === 'user'"
            class="flex items-end mb-2 justify-end"
          >
            <div
              class="bg-purple-500 text-white p-2 rounded-tr-lg rounded-br-lg rounded-bl-lg w-max inline-block"
            >
              {{ item.content }}
            </div>
            <img
              class="w-8 h-8 rounded-full ml-2"
              src="../assets/supabase-logo.png"
              alt="用户头像"
            />
          </div>

          <!-- AI 聊天气泡 -->
          <div v-else class="flex items-end mb-2">
            <img
              class="w-8 h-8 rounded-full mr-2"
              src="../assets/openai-logo.png"
              alt="AI头像"
            />
            <div
              class="bg-blue-500 text-white p-2 rounded-tl-lg rounded-bl-lg rounded-br-lg w-max inline-block"
            >
              <div v-html="item.content"></div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- 输入区域 -->
    <footer class="fixed bottom-0 w-full p-4">
      <div class="flex items-center">
        <input
          type="text"
          class="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none"
          placeholder="输入您的消息..."
          v-model="newMessage"
          @keypress.enter="sendMessage"
        />
        <div className="flex justify-end absolute right-0 top-0 bottom-0">
              
        </div>
        <button
          @click="sendMessage"
          class="bg-purple-500 px-4 py-2 text-white font-bold rounded-r-lg"
        >
          发送
        </button>
       
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { fetchChat } from "../api";


const newMessage = ref("");

const chatMessages = ref<{ type: string; content: string }[]>([]);

const messageHistory: string[] = [];

async function sendMessage() {
  const message = {
    type: "user",
    content: newMessage.value,
  };


  chatMessages.value.push(message);

  fetchChat(message.content, messageHistory).then(({ data }) => {
    chatMessages.value.push({
      type: "ai",
      content: data.data,
    });
  });
  newMessage.value = "";
}
</script>

<style scoped></style>