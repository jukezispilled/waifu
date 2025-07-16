import { Message } from "../messages/messages";
import { getWindowAI } from 'window.ai';

export async function getChatResponse(messages: Message[], apiKey: string) {
  // function currently not used
  throw new Error("Not implemented");
}

export async function getChatResponseStream(
  messages: Message[], 
  apiKey: string, // Keep for backwards compatibility but not used
  openRouterKey: string // Keep for backwards compatibility but not used
) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        let isStreamed = false;
        
        // Convert messages to Claude API format if needed
        const claudeMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Call your Next.js API route - no API key needed since it's in the environment
        const generation = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: claudeMessages,
            model: "claude-3-5-sonnet-20241022", // or "claude-3-opus-20240229"
            maxTokens: 200,
            temperature: 0.7
            // No apiKey needed - it's handled server-side via environment variable
          })
        });

        if (!generation.ok) {
          const errorData = await generation.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`API error: ${generation.status} ${generation.statusText} - ${errorData.error || ''}`);
        }

        if (generation.body) {
          const reader = generation.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Convert the Uint8Array to a string
              let chunk = new TextDecoder().decode(value);
              
              // Split the chunk into lines
              let lines = chunk.split('\n');

              // Filter out empty lines and lines that do not start with "data:"
              const dataLines = lines.filter(line => line.startsWith("data:"));

              // Extract and parse the JSON from each data line
              const parsedMessages = dataLines.map(line => {
                try {
                  // Remove the "data: " prefix and parse the JSON
                  const jsonStr = line.substring(5); // "data: ".length == 5
                  return JSON.parse(jsonStr);
                } catch (e) {
                  return null; // Skip invalid JSON
                }
              }).filter(msg => msg !== null);

              // Process messages and enqueue content to the controller
              try {
                parsedMessages.forEach((message) => {
                  // Claude API streaming format
                  if (message.type === 'content_block_delta' && message.delta?.text) {
                    controller.enqueue(message.delta.text);
                  }
                });
              } catch (error) {
                console.error('Error processing stream messages:', error);
                throw error;
              }

              isStreamed = true;
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
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}