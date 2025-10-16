/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { refreshMemoryLogic, showMemoryLogic } from '@google/gemini-cli-core';
import { MessageType } from '../types.js';
import type { SlashCommand, SlashCommandActionReturn } from './types.js';
import { CommandKind } from './types.js';

export const memoryCommand: SlashCommand = {
  name: 'memory',
  description: 'Commands for interacting with memory.',
  kind: CommandKind.BUILT_IN,
  subCommands: [
    {
      name: 'show',
      description: 'Show the current memory contents.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        const result = showMemoryLogic({
          userMemory: context.services.config?.getUserMemory() || '',
          geminiMdFileCount:
            context.services.config?.getGeminiMdFileCount() || 0,
        });

        for (const msg of result.messages) {
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: msg.message,
            },
            Date.now(),
          );
        }
      },
    },
    {
      name: 'add',
      description: 'Add content to the memory.',
      kind: CommandKind.BUILT_IN,
      action: (context, args): SlashCommandActionReturn | void => {
        if (!args || args.trim() === '') {
          return {
            type: 'message',
            messageType: 'error',
            content: 'Usage: /memory add <text to remember>',
          };
        }

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: `Attempting to save to memory: "${args.trim()}"`,
          },
          Date.now(),
        );

        return {
          type: 'tool',
          toolName: 'save_memory',
          toolArgs: { fact: args.trim() },
        };
      },
    },
    {
      name: 'refresh',
      description: 'Refresh the memory from the source.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: 'Refreshing memory from source files...',
          },
          Date.now(),
        );

        const config = await context.services.config;
        const settings = context.services.settings;
        if (!config) {
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: 'Error refreshing memory: Config not available',
            },
            Date.now(),
          );
          return;
        }

        const result = await refreshMemoryLogic({
          workingDir: config.getWorkingDir(),
          includeDirs: config.shouldLoadMemoryFromIncludeDirectories()
            ? config.getWorkspaceContext().getDirectories()
            : [],
          debugMode: config.getDebugMode(),
          fileService: config.getFileService(),
          extensionContextFilePaths: config.getExtensionContextFilePaths(),
          isTrustedFolder: config.isTrustedFolder(),
          importFormat: settings.merged.context?.importFormat || 'tree',
          fileFilteringOptions: config.getFileFilteringOptions(),
          discoveryMaxDirs: settings.merged.context?.discoveryMaxDirs,
        });

        const now = Date.now();
        for (const msg of result.messages) {
          context.ui.addItem(
            {
              type: msg.severity,
              text: msg.message,
            },
            now,
          );
        }

        if (result.data) {
          const { memoryContent, fileCount, filePaths } = result.data;
          config.setUserMemory(memoryContent);
          config.setGeminiMdFileCount(fileCount);
          config.setGeminiMdFilePaths(filePaths);
          context.ui.setGeminiMdFileCount(fileCount);
        }
      },
    },
    {
      name: 'list',
      description: 'Lists the paths of the GEMINI.md files in use.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        const filePaths = context.services.config?.getGeminiMdFilePaths() || [];
        const fileCount = filePaths.length;

        const messageContent =
          fileCount > 0
            ? `There are ${fileCount} GEMINI.md file(s) in use:\n\n${filePaths.join('\n')}`
            : 'No GEMINI.md files in use.';

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: messageContent,
          },
          Date.now(),
        );
      },
    },
  ],
};
