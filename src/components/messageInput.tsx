import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { TextField, Button, Window, WindowContent, Panel, Hourglass } from 'react95';
import original from 'react95/dist/themes/original';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'ms_sans_serif', sans-serif;
    background-color: #008080;
  }
`;

type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onKeyDownUserMessage: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickMicButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const MessageInput = ({
  userMessage,
  isMicRecording,
  isChatProcessing,
  onChangeUserMessage,
  onKeyDownUserMessage,
  onClickMicButton,
  onClickSendButton,
}: Props) => {
  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      <Window className="font-mono" style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 20 }}>
        <WindowContent>
          <Panel
            variant="well"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
            }}
          >
            <Button
              disabled={isChatProcessing}
              onClick={onClickMicButton}
              active={isMicRecording}
              style={{ minWidth: '40px', height: '40px' }}
            >
              🎤
            </Button>

            <TextField
              placeholder="Message"
              value={userMessage}
              onChange={onChangeUserMessage}
              onKeyDown={onKeyDownUserMessage}
              fullWidth
              disabled={isChatProcessing}
            />

            {isChatProcessing ? (
              <Hourglass style={{ width: '40px', height: '40px' }} />
            ) : (
              <Button
                disabled={!userMessage}
                onClick={onClickSendButton}
                style={{ minWidth: '40px', height: '40px' }}
              >
                📤
              </Button>
            )}
          </Panel>
        </WindowContent>
      </Window>
    </ThemeProvider>
  );
};