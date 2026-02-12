
export interface QwenTTSResponse {
  output?: {
    choices?: Array<{
      message: {
        content: Array<{
          audio?: string; // URL to audio
        }>;
      };
    }>;
  };
  usage?: any;
  request_id?: string;
}

export async function generateQwenTTS(
  text: string, 
  apiKey: string
): Promise<string | null> {
  const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-WorkSpace": "modal",
      },
      body: JSON.stringify({
        model: "qwen3-tts-flash",
        input: {
          messages: [
            {
              role: "user",
              content: [
                { text: text }
              ]
            }
          ]
        },
        parameters: {
          voice: "Cherry" 
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Qwen TTS Error:", err);
      return null;
    }

    const data = await response.json();
    const audioUrl = data?.output?.choices?.[0]?.message?.content?.[0]?.audio;
    
    if (audioUrl) {
      // Download the audio file
      const audioResp = await fetch(audioUrl);
      const arrayBuffer = await audioResp.arrayBuffer();
      // Convert to Base64
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return null;

  } catch (e) {
    console.error("Qwen TTS Fetch Error:", e);
    return null;
  }
}
