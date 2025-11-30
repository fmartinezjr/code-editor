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
import Editor, { loader } from "@monaco-editor/react";

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' } });

const DEFAULT_CODE = `
console.log("Hello, World!");
`;

export const CodeEditor = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);

  const runCode = () => {
    const logs: string[] = [];
    const capture = (level: string) => (...args: any[]) => {
      logs.push(`[${level}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
    };

    const [log, error, warn] = [console.log, console.error, console.warn];
    console.log = capture('LOG');
    console.error = capture('ERROR');
    console.warn = capture('WARN');

    try {
      eval(code);
    } catch (e) {
      logs.push(`[ERROR] ${e instanceof Error ? e.message : e}`);
    }

    [console.log, console.error, console.warn] = [log, error, warn];
    setOutput(logs);
  };

  const clearConsole = () => setOutput([]);
  const resetCode = () => {
    setCode(DEFAULT_CODE);
    setOutput([]);
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
          <Button leftSection={<Play size={18} />} onClick={runCode} color="green">
            Run Code
          </Button>
          <Button leftSection={<Trash2 size={18} />} onClick={clearConsole} variant="light">
            Clear Console
          </Button>
          <Button leftSection={<RotateCcw size={18} />} onClick={resetCode} variant="light" color="gray">
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
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  tabSize: 2,
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
              <Paper p="md" style={{
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
                fontFamily: "monospace",
                fontSize: "13px",
                minHeight: "500px",
                maxHeight: "500px",
                overflowY: "auto",
              }}>
                {output.length === 0 ? (
                  <Text c="dimmed" size="sm">Console output will appear here...</Text>
                ) : (
                  output.map((line, i) => <div key={i}>{line}</div>)
                )}
              </Paper>
            </Card.Section>
          </Card>
        </div>
      </Stack>
    </Container>
  );
};
