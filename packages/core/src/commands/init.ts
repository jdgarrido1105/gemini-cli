/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CommandResult } from './results.js';

// Define the context required for the core logic.
// This avoids pulling in the entire CLI's CommandContext.
export interface InitCommandContext {
  targetDir: string;
}

const INIT_PROMPT = `
You are an AI agent that brings the power of Gemini directly into the terminal. Your task is to analyze the current directory and generate a comprehensive GEMINI.md file to be used as instructional context for future interactions.

**Analysis Process:**

1.  **Initial Exploration:**
    *   Start by listing the files and directories to get a high-level overview of the structure.
    *   Read the README file (e.g., \`README.md\`, \`README.txt\`) if it exists. This is often the best place to start.

2.  **Iterative Deep Dive (up to 10 files):**
    *   Based on your initial findings, select a few files that seem most important (e.g., configuration files, main source files, documentation).
    *   Read them. As you learn more, refine your understanding and decide which files to read next. You don't need to decide all 10 files at once. Let your discoveries guide your exploration.

3.  **Identify Project Type:**
    *   **Code Project:** Look for clues like \`package.json\`, \`requirements.txt\`, \`pom.xml\`, \`go.mod\`, \`Cargo.toml\`, \`build.gradle\`, or a \`src\` directory. If you find them, this is likely a software project.
    *   **Non-Code Project:** If you don't find code-related files, this might be a directory for documentation, research papers, notes, or something else.

**GEMINI.md Content Generation:**

**For a Code Project:**

*   **Project Overview:** Write a clear and concise summary of the project's purpose, main technologies, and architecture.
*   **Building and Running:** Document the key commands for building, running, and testing the project. Infer these from the files you've read (e.g., \`scripts\` in \`package.json\`, \`Makefile\`, etc.). If you can't find explicit commands, provide a placeholder with a TODO.
*   **Development Conventions:** Describe any coding styles, testing practices, or contribution guidelines you can infer from the codebase.

**For a Non-Code Project:**

*   **Directory Overview:** Describe the purpose and contents of the directory. What is it for? What kind of information does it hold?
*   **Key Files:** List the most important files and briefly explain what they contain.
*   **Usage:** Explain how the contents of this directory are intended to be used.

**Final Output:**

Write the complete content to the \`GEMINI.md\` file. The output must be well-formatted Markdown.
`;

export function initCommandLogic(context: InitCommandContext): CommandResult {
  const geminiMdPath = path.join(context.targetDir, 'GEMINI.md');

  if (fs.existsSync(geminiMdPath)) {
    return {
      messages: [
        {
          severity: 'info',
          message:
            'A GEMINI.md file already exists in this directory. No changes were made.',
        },
      ],
    };
  }

  // Create an empty GEMINI.md file
  fs.writeFileSync(geminiMdPath, '', 'utf8');

  return {
    messages: [
      {
        severity: 'info',
        message:
          'Empty GEMINI.md created. Now analyzing the project to populate it.',
      },
    ],
    action: {
      type: 'submit-prompt',
      prompt: INIT_PROMPT,
    },
  };
}
