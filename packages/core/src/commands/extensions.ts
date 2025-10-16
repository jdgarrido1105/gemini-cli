/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandResult } from './results.js';
import type { GeminiCLIExtension } from '../config/config.js';

export interface ExtensionsListContext {
  getExtensions: () => GeminiCLIExtension[];
}

export function extensionsListLogic(
  context: ExtensionsListContext,
): CommandResult<{ extensions: GeminiCLIExtension[] }> {
  const extensions = context.getExtensions();
  return {
    messages: [],
    data: {
      extensions,
    },
  };
}
