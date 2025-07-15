import { Message } from "../messages/messages";
import { getWindowAI } from 'window.ai';

export async function getChatResponse(messages: Message[], apiKey: string) {
  // function currently not used
  throw new Error("Not implemented");

  /*
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  // ブラウザからAPIを叩くときに発生するエラーを無くすworkaround
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "エラーが発生しました";

  return { message: message };
  */
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string,
  ollamaUrl: string = "https://4b2759319402.ngrok-free.app", // Default Ollama URL
  model: string = "llama3.2" // Default model, change to your preferred model
) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        let isStreamed = false;
        
        // Convert messages to Ollama format if needed
        const ollamaMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const generation = await fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
            // Removed ngrok headers that cause CORS issues
          },
          body: JSON.stringify({
            model: model,
            messages: ollamaMessages,
            stream: true,
            options: {
              temperature: 0.7,
              num_predict: 200, // Equivalent to max_tokens
            }
          })
        });

        if (!generation.ok) {
          const errorText = await generation.text();
          console.error('Ollama API Error Response:', errorText);
          throw new Error(`Ollama API error: ${generation.status} ${generation.statusText} - ${errorText}`);
        }

        if (generation.body) {
          const reader = generation.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Convert the Uint8Array to a string
              let chunk = new TextDecoder().decode(value);
              
              // Split the chunk into lines (Ollama sends one JSON object per line)
              let lines = chunk.split('\n').filter(line => line.trim());

              // Process each line
              for (const line of lines) {
                try {
                  const parsedMessage = JSON.parse(line);
                  
                  // Check if this is the final message
                  if (parsedMessage.done) {
                    break;
                  }
                  
                  // Extract content from the message
                  const content = parsedMessage.message?.content || '';
                  
                  if (content) {
                    controller.enqueue(content);
                    isStreamed = true;
                  }
                } catch (parseError) {
                  console.error('Error parsing Ollama response line:', parseError);
                  console.error('Problematic line:', line);
                  // Continue processing other lines
                }
              }
            }
          } catch (error) {
            console.error('Error reading the stream', error);
            throw error;
          } finally {
            reader.releaseLock();
          }
        }

        // Handle case where streaming is not supported
        if (!isStreamed) {
          console.error('Streaming not supported! Need to handle this case.');
          // Fallback to non-streaming request
          const fallbackResponse = await fetch(`${ollamaUrl}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
              // Removed ngrok headers that cause CORS issues
            },
            body: JSON.stringify({
              model: model,
              messages: ollamaMessages,
              stream: false,
              options: {
                temperature: 0.7,
                num_predict: 200,
              }
            })
          });
          
          if (fallbackResponse.ok) {
            const result = await fallbackResponse.json();
            controller.enqueue(result.message?.content || '');
          } else {
            const errorText = await fallbackResponse.text();
            console.error('Fallback request failed:', errorText);
            throw new Error(`Fallback request failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
          }
        }
      } catch (error) {
        console.error('Ollama API error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

// Alternative non-streaming function for Ollama
export async function getChatResponseOllama(
  messages: Message[],
  ollamaUrl: string = "https://4b2759319402.ngrok-free.app",
  model: string = "llama3.2"
) {
  const ollamaMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      // Removed ngrok headers that cause CORS issues
    },
    body: JSON.stringify({
      model: model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 200,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ollama API Error Response:', errorText);
    throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return { message: result.message?.content || "エラーが発生しました" };
}

// Helper function to test Ollama connection
export async function testOllamaConnection(ollamaUrl: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: "GET",
      headers: {
        // Minimal headers to avoid CORS issues
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }

    const data = await response.json();
    const models = data.models?.map((model: any) => model.name) || [];
    
    return { 
      success: true, 
      models 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}