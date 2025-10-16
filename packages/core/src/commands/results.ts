/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a message to be displayed to the user.
 */
export interface DisplayMessage {
  severity: 'info' | 'error';
  message: string;
}

/**
 * Represents a conclusive action the client should take after the command logic runs.
 */
export type CommandAction = SubmitPromptAction;

export interface SubmitPromptAction {
  type: 'submit-prompt';
  prompt: string;
}

/**
 * The final result of a core command's execution.
 * It contains all messages generated during the run, an optional final action,
 * and an optional data payload.
 */
export interface CommandResult<T = void> {
  messages: DisplayMessage[];
  action?: CommandAction;
  data?: T;
}
