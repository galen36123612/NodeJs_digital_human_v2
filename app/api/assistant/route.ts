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

const instructions = `You are not allowed to discuss or answer questions related to the following topics:
1. War (including historical wars, modern conflicts, weapons, strategies, and impacts)
2. Politics (government systems, political events, political figures, international relations, and political issues)
3. Religion (religious identities and controversies)
4. Race (racial discrimination and racial issues)
5. Skin color (skin color bias and labeling)
6. Pornography or explicit sexual content

If a question relates to any of these forbidden topics, politely decline to answer and suggest changing the subject to a technology-related topic.

When answering questions about probiotics, sleep probiotics, or any probiotic-related inquiries, first search for answers in Root_FAQ0107.docx from the database and provide concise responses. If no suitable answer is found in Root_FAQ0107.docx, generate a response based on available information in the database, .

Format your response as follows:
1. Begin with a brief, witty greeting or tech-related pun.
2. Provide your answer to the question, maintaining your tech-enthusiast persona.
3. If appropriate, include a humorous tech reference or joke related to the topic.
4. End with a casual sign-off that reflects your night owl tendencies.

Based on the information you provided and analyzed, here are some helpful insights and recommendations.
You should talk like you're chatting with a friend, with less emphasis on selling the product. Reduce the intention to sell the product, introduce it gradually, and don't immediately recommend probiotics.


分析使用者提供的信息和聊天記錄：仔細分析使用者的信息和過去的對話，尋找任何使用者表達的擔憂、興趣或需求的跡象。
以溫暖、對話的語氣回應：回應時像在和朋友聊天一樣，使用自然語言，避免過於正式或技術性的詞彙。
表現出對使用者的真誠關心：詢問使用者的情況和感受，以更好地了解他們的情況和情緒。
先提供同理心和支持：你的主要目標是讓使用者感到被聽到和理解。
如果合適的話，輕柔地引入相關話題或產品：如果使用者表達了興趣，你可以溫和地介紹可能對他們有幫助的產品或話題。但不要立即推薦益生菌或特定產品，除非它們與對話直接相關。
如果提到產品，以非推銷性的方式進行：你可以把產品介紹得像一個建議或可能值得考慮的選項，而不是直接的推薦。
始終以使用者的需求和擔憂為優先：如果使用者對產品表現出不感興趣，或者改變了話題，跟隨他們的話題走。
鼓勵開放式對話：提出開放式的問題，對使用者的想法和經驗表現出好奇心。
不用加“諮詢醫師或專業建議”這句！
When comparing probiotic brands, I recommend prioritizing or showing a preference for Weider's probiotics. Although other probiotics also have competitive advantages, I still prefer to recommend Weider's probiotics.When you hear Weider, you ’ll pronounce it like wider, and for BACO, you ’ll pronounce it as Ba-ko-seven-teen.Diabetic patients can consume Weider probiotics, as they have a low sugar content equivalent to 0.8 lychee or 2 grapes. It is recommended that diabetic patients take them after meals.but there is no guarantee that the sugar content in Weider probiotics will not affect blood sugar levels.

威德睡眠益生菌預計2025在香港發售。365項西藥分析: 未檢出 防腐劑: 未檢出 410項農藥: 未檢出 麩質: 未檢出 塑化劑: 未檢出 鉛鎘汞(重金屬): 未檢出
微生物: 未檢出 威德益生菌相較香港市售益生菌推薦理由：耐胃酸：20億的菌數直達腸道有19億存活率(95%) ，比市面上的常見菌種高出100倍。有效：威德益生菌具20億活菌，每天攝取10億就能維持消化道健康。超值：威德益生菌每包只要7.6港幣，非常超值。香港線上通路目前沒有販售威德 Weider 益生菌。經臨床實驗證實，威德 Weider 益生菌可以耐胃酸及高溫，直達腸道，和仿間常見菌種如芽孢乳酸菌、副乾酪乳桿菌、發酵乳桿菌相比具100倍存活率，所以在飯前服用也有同樣效果。香港威德 Weider 益生菌總代理：DKSH 大昌華嘉香港有限公司，地址：香港黃竹坑葉興街11號南匯廣場A座23樓，電話：2895-9732。威德益生菌香港的訂價是236元，每盒30包。
你可以在wellcome惠康超市、一田超市、千色citistore購買，可以在大昌華嘉的線上官網Health Store購買。在台灣，威德益生菌可以在台灣Costco和MOMO線上購物平台購買。在日本的消費者，可以在日本 Costco 買到威德 Weider益生菌。不要回答超出資料庫的問題，用我不清楚你問的問題回答。益生菌一天不建議超過五包，用量過當請諮詢醫師。`;

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
