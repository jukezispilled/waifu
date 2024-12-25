import { Message } from "../messages/messages";
import axios from 'axios';

const serverUrl = 'https://f914-2603-7080-1300-7196-e1fd-753c-a42e-be4a.ngrok-free.app';

export async function getChatResponse(messages: Message[], apiKey: string) {
  // function currently not used
  throw new Error("Not implemented");
}

export async function getChatResponseStream(
  messages: Message[],
  roomId: string,
  userId: string,
  userName: string = 'User',
  cancelToken?: any
) {
  console.log('getChatResponseStream');
  console.log('messages', messages);

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      let buffer = '';
      
      try {
        const lastMessage = messages[messages.length - 1];
        const response = await axios({
          method: 'post',
          url: `${serverUrl}/0492e0df-4007-0c04-b194-3dc1aadb32c6/message`,
          data: {
            text: lastMessage.content,
            roomId: roomId,
            userId: userId,
            userName: userName
          },
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'text',
          transformResponse: (data) => {
            // Process incoming data in chunks
            buffer += data;
            const lines = buffer.split('\n');
            
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || '';

            // Process complete lines
            lines.forEach(line => {
              if (line.trim()) {
                try {
                  const jsonData = JSON.parse(line);
                  if (jsonData && jsonData[0] && jsonData[0].text) {
                    controller.enqueue(jsonData[0].text);
                  }
                } catch (error) {
                  console.debug('Invalid JSON line:', line);
                }
              }
            });

            return data; // Return original data for axios
          },
          cancelToken: cancelToken
        });

        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const jsonData = JSON.parse(buffer);
            if (jsonData && jsonData[0] && jsonData[0].text) {
              controller.enqueue(jsonData[0].text);
            }
          } catch (error) {
            console.debug('Invalid JSON in final buffer:', buffer);
          }
        }

        // Close the stream when the response is complete
        controller.close();

      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error in stream:', error);
          controller.error(error);
        }
        controller.close();
      }
    }
  });

  return stream;
}