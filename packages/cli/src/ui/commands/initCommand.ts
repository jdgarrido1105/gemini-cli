/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { initCommandLogic } from '@google/gemini-cli-core';
import type {
  CommandContext,
  SlashCommand,
  SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';

export const initCommand: SlashCommand = {
  name: 'init',
  description: 'Analyzes the project and creates a tailored GEMINI.md file.',
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
    _args: string,
  ): Promise<SlashCommandActionReturn | void> => {
    if (!context.services.config) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Configuration not available.',
      };
    }

    const result = initCommandLogic({
      targetDir: context.services.config.getTargetDir(),
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

    if (result.action?.prompt) {
      return {
        type: 'submit_prompt',
        content: result.action.prompt,
      };
    }
  },
};
