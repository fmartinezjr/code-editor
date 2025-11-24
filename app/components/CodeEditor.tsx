"use client";

import { useState, useRef, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Card,
  Group,
  Box,
  Paper,
  Divider,
} from "@mantine/core";
import { Play, RotateCcw, Trash2, Code2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { notifications } from "@mantine/notifications";

const DEFAULT_CODE = `
console.log("Hello, World!");
`;

export const CodeEditor = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);

    try {
      // Create a new iframe to run the code in isolation
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc) {
          // Clear previous content
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 16px;
                    margin: 0;
                    color: #333;
                    background: white;
                  }
                  h1, h2, h3 { margin-top: 0; }
                </style>
              </head>
              <body>
                <script>
                  // Capture console methods
                  const originalLog = console.log;
                  const originalError = console.error;
                  const originalWarn = console.warn;
                  const originalInfo = console.info;

                  const sendMessage = (type, ...args) => {
                    const message = args.map(arg => {
                      if (typeof arg === 'object') {
                        try {
                          return JSON.stringify(arg, null, 2);
                        } catch (e) {
                          return String(arg);
                        }
                      }
                      return String(arg);
                    }).join(' ');

                    window.parent.postMessage({
                      type: 'console',
                      level: type,
                      message
                    }, '*');
                  };

                  console.log = (...args) => {
                    originalLog.apply(console, args);
                    sendMessage('log', ...args);
                  };

                  console.error = (...args) => {
                    originalError.apply(console, args);
                    sendMessage('error', ...args);
                  };

                  console.warn = (...args) => {
                    originalWarn.apply(console, args);
                    sendMessage('warn', ...args);
                  };

                  console.info = (...args) => {
                    originalInfo.apply(console, args);
                    sendMessage('info', ...args);
                  };

                  // Capture errors
                  window.onerror = (message, source, lineno, colno, error) => {
                    console.error(\`Error at line \${lineno}: \${message}\`);
                    return true;
                  };

                  // Run user code
                  try {
                    ${code}
                  } catch (error) {
                    console.error('Runtime Error:', error.message);
                  }
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setOutput((prev) => [...prev, `❌ Error: ${errorMessage}`]);
      notifications.show({
        title: "Execution Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearConsole = () => {
    setOutput([]);
    notifications.show({
      title: "Console Cleared",
      message: "Output has been cleared",
      color: "blue",
    });
  };

  const resetCode = () => {
    setCode(DEFAULT_CODE);
    setOutput([]);
    notifications.show({
      title: "Code Reset",
      message: "Editor has been reset to default code",
      color: "blue",
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const { level, message } = event.data;
        let prefix = "[INFO]";
        if (level === "error") prefix = "[ERROR]";
        else if (level === "warn") prefix = "[WARN]";
        else if (level === "log") prefix = "[LOG]";

        setOutput((prev) => [...prev, `${prefix} ${message}`]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Box>
          <Group gap="sm" mb="xs">
            <Code2 size={32} color="var(--mantine-color-blue-6)" />
            <Title order={1} size="h2" c="my-blue.9">
              JavaScript Code Editor
            </Title>
          </Group>
        </Box>

        <Group gap="md">
          <Button
            leftSection={<Play size={18} />}
            onClick={runCode}
            loading={isRunning}
            color="green"
            size="md"
          >
            Run Code
          </Button>
          <Button
            leftSection={<Trash2 size={18} />}
            onClick={clearConsole}
            variant="light"
            color="blue"
            size="md"
          >
            Clear Console
          </Button>
          <Button
            leftSection={<RotateCcw size={18} />}
            onClick={resetCode}
            variant="light"
            color="gray"
            size="md"
          >
            Reset Code
          </Button>
        </Group>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            minHeight: "600px",
          }}
        >

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={600} size="sm">
                Code Editor
              </Text>
            </Card.Section>
            <Card.Section p={0}>
              <Editor
                height="550px"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                }}
              />
            </Card.Section>
          </Card>

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Text fw={600} size="sm">
                  Output
                </Text>
                <Text size="xs" c="dimmed">
                  {output.length} message{output.length !== 1 ? "s" : ""}
                </Text>
              </Group>
            </Card.Section>

            <Card.Section p="md">
              <Paper
                p="md"
                style={{
                  backgroundColor: "#1e1e1e",
                  color: "#d4d4d4",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  minHeight: "200px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                {output.length === 0 ? (
                  <Text c="dimmed" size="sm" fs="italic">
                    Console output will appear here...
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {output.map((line, index) => (
                      <div key={index} style={{ whiteSpace: "pre-wrap" }}>
                        {line}
                      </div>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Card.Section>

            <Divider my="sm" />

            <Card.Section p="md">
              <Text fw={600} size="sm" mb="xs">
                Visual Output (DOM)
              </Text>
              <Paper
                withBorder
                style={{
                  minHeight: "200px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  backgroundColor: "white",
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="Code Output"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "200px",
                    border: "none",
                  }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </Paper>
            </Card.Section>
          </Card>
        </div>
      </Stack>
    </Container>
  );
};
