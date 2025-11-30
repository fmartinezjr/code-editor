"use client";

import { useState } from "react";
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

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logs: string[] = [];

    console.log = (...args: any[]) => {
      originalLog(...args);
      logs.push(`[LOG] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      logs.push(`[ERROR] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      logs.push(`[WARN] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
    };

    try {
      eval(code);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`[ERROR] ${msg}`);
    }

    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    setOutput(logs);
    setIsRunning(false);
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
          </Card>
        </div>
      </Stack>
    </Container>
  );
};
