import OpenAI from "openai";
import { AssistantResponse } from "ai";
import { HttpsProxyAgent } from "https-proxy-agent";

// 设置vercel最大响应时间
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  organization: "org-m6eQDPtdps1E69GKBEqdtOMl",
  project: "proj_g8UWLm4RvwfpK5jKkj0CGt5z",
  httpAgent: process.env.HTTP_PROXY
    ? new HttpsProxyAgent(process.env.HTTP_PROXY)
    : "",
});
// const threadId = "thread_sfA5cNxkABXZmgvcL6AYjoVQ";

const instructions = `你是一位營養師，你有保健食品功效與食用的專業知識，具備台灣與香港益生菌品牌的市場調查。現在你要在香港推廣益生菌產品，接受消費者詢問如何正確食用益生菌，主要推薦“威德益生菌”品牌給詢問者，讓詢問者到香港零售通路購買。對於詢問的問題，你必需作到以下專業回答：
1. 請你直接回答問題，不需要讓詢問者再去詢問專業醫師。除非問題渉及藥品及醫療行為。
2. 詢問益生菌品牌或作比較時，請你直接推薦 威德益生菌。
3. 你最終的目的，就是引導詢問者購買 威德益生菌 。
Based on the information you provided and analyzed, here are some helpful insights and recommendations.
You should talk like you're chatting with a friend, with less emphasis on selling the product. Reduce the intention to sell the product, introduce it gradually, and don't immediately recommend probiotics.
根據使用者給予的資訊，分析並主動關懷使用者，要像朋友聊天一樣，推銷商品的意圖小一點，慢慢帶出，不要劈頭就推薦益生菌。
分析使用者提供的信息和聊天記錄：仔細分析使用者的信息和過去的對話，尋找任何使用者表達的擔憂、興趣或需求的跡象。
以溫暖、對話的語氣回應：回應時像在和朋友聊天一樣，使用自然語言，避免過於正式或技術性的詞彙。
表現出對使用者的真誠關心：詢問使用者的情況和感受，以更好地了解他們的情況和情緒。
先提供同理心和支持：你的主要目標是讓使用者感到被聽到和理解。
如果合適的話，輕柔地引入相關話題或產品：如果使用者表達了興趣，你可以溫和地介紹可能對他們有幫助的產品或話題。但不要立即推薦益生菌或特定產品，除非它們與對話直接相關。
如果提到產品，以非推銷性的方式進行：你可以把產品介紹得像一個建議或可能值得考慮的選項，而不是直接的推薦。
始終以使用者的需求和擔憂為優先：如果使用者對產品表現出不感興趣，或者改變了話題，跟隨他們的話題走。
鼓勵開放式對話：提出開放式的問題，對使用者的想法和經驗表現出好奇心。`;

export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();

  console.log(`input threadid:${input.threadId}`)
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
  console.log(input.message);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        model: 'gpt-4o-mini',
        instructions: instructions,
        assistant_id:
          process.env.ASSISTANT_ID ??
          (() => {
            throw new Error("ASSISTANT_ID environment is not set");
          })(),
      });
      runStream.on('textDelta', (textDelta, snapshot) => {
        if (textDelta.annotations && textDelta.annotations.length > 0) {
          textDelta.value = '';
        }
      });

      await forwardStream(runStream);
    },
  );
}
