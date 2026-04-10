'use client';

import { CommandPalette } from './command-palette';
import { KeyboardShortcuts } from './keyboard-shortcuts';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function CommandPaletteWrapper() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      <CommandPalette />
      <KeyboardShortcuts />
    </>
  );
}