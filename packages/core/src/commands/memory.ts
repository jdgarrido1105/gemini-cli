/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { homedir } from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CommandResult } from './results.js';
import { loadServerHierarchicalMemory } from '../utils/memoryDiscovery.js';
import { getErrorMessage } from '../utils/errors.js';
import type { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import type { FileFilteringOptions } from '../config/constants.js';

export interface ShowMemoryContext {
  userMemory: string;
  geminiMdFileCount: number;
}

export function showMemoryLogic(context: ShowMemoryContext): CommandResult {
  const message =
    context.userMemory.length > 0
      ? `Current memory content from ${context.geminiMdFileCount} file(s):\n\n---\n${context.userMemory}\n---`
      : 'Memory is currently empty.';

  return {
    messages: [
      {
        severity: 'info',
        message,
      },
    ],
  };
}

export interface RefreshMemoryContext {
  workingDir: string;
  includeDirs: readonly string[];
  debugMode: boolean;
  fileService: FileDiscoveryService;
  extensionContextFilePaths: string[];
  isTrustedFolder: boolean;
  importFormat: 'flat' | 'tree';
  fileFilteringOptions?: FileFilteringOptions;
  discoveryMaxDirs?: number;
}

export interface RefreshMemoryData {
  memoryContent: string;
  fileCount: number;
  filePaths: string[];
}

export async function refreshMemoryLogic(
  context: RefreshMemoryContext,
): Promise<CommandResult<RefreshMemoryData>> {
  try {
    // This logic is duplicated from the original CLI config loader.
    const realCwd = fs.realpathSync(path.resolve(context.workingDir));
    const realHome = fs.realpathSync(path.resolve(homedir()));
    const isHomeDirectory = realCwd === realHome;
    const effectiveCwd = isHomeDirectory ? '' : context.workingDir;

    if (context.debugMode) {
      // A bit of a hack to get some logging, since we don't have a logger here.
      console.debug(
        '[DEBUG]',
        `Core: Delegating hierarchical memory load for CWD: ${context.workingDir} (memoryImportFormat: ${context.importFormat})`,
      );
    }

    const { memoryContent, fileCount, filePaths } =
      await loadServerHierarchicalMemory(
        effectiveCwd,
        context.includeDirs,
        context.debugMode,
        context.fileService,
        context.extensionContextFilePaths,
        context.isTrustedFolder,
        context.importFormat,
        context.fileFilteringOptions,
        context.discoveryMaxDirs,
      );

    const successMessage =
      memoryContent.length > 0
        ? `Memory refreshed successfully. Loaded ${memoryContent.length} characters from ${fileCount} file(s).`
        : 'Memory refreshed successfully. No memory content found.';

    return {
      messages: [{ severity: 'info', message: successMessage }],
      data: { memoryContent, fileCount, filePaths },
    };
  } catch (error) {
    return {
      messages: [
        {
          severity: 'error',
          message: `Error refreshing memory: ${getErrorMessage(error)}`,
        },
      ],
    };
  }
}
