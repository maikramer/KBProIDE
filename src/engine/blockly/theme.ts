import * as Blockly from 'blockly/core';

export const createTheme = (isDark: boolean) => {
  const base = isDark ? Blockly.Themes.Classic : Blockly.Themes.Classic;
  return Blockly.Theme.defineTheme('kbide-theme', {
    name: 'kbide-theme',
    base,
    componentStyles: {
      workspaceBackgroundColour: isDark ? '#0f172a' : '#ffffff',
      toolboxBackgroundColour: isDark ? '#111827' : '#f9fafb',
      toolboxForegroundColour: isDark ? '#e5e7eb' : '#111827',
      flyoutBackgroundColour: isDark ? '#0b1220' : '#ffffff',
      flyoutForegroundColour: isDark ? '#cbd5e1' : '#1f2937',
      flyoutOpacity: 1,
      scrollbarColour: isDark ? '#334155' : '#cbd5e1',
      insertionMarkerColour: '#60a5fa',
      insertionMarkerOpacity: 0.4,
      cursorColour: '#60a5fa',
      selectedGlowColour: '#93c5fd',
      selectedGlowOpacity: 0.4,
      replacementGlowColour: '#f87171',
      replacementGlowOpacity: 0.5,
    },
    categoryStyles: {
      logic_category: { colour: '#5C81A6' },
      loop_category: { colour: '#5CA65C' },
      math_category: { colour: '#5C68A6' },
      text_category: { colour: '#5CA68D' },
      esp32_category: { colour: '#A65C81' },
      sensor_category: { colour: '#FF6B6B' },
      actuator_category: { colour: '#4ECDC4' },
    },
    blockStyles: {
      logic_blocks: { colourPrimary: '#5C81A6', colourSecondary: '#4A6B8A', colourTertiary: '#3A5570' },
      loop_blocks: { colourPrimary: '#5CA65C', colourSecondary: '#4A8A4A', colourTertiary: '#3A7038' },
      math_blocks: { colourPrimary: '#5C68A6', colourSecondary: '#4A548A', colourTertiary: '#3A4270' },
      text_blocks: { colourPrimary: '#5CA68D', colourSecondary: '#4A8A71', colourTertiary: '#3A7059' },
      esp32_blocks: { colourPrimary: '#A65C81', colourSecondary: '#8A4A65', colourTertiary: '#703851' },
      sensor_blocks: { colourPrimary: '#FF6B6B', colourSecondary: '#E55555', colourTertiary: '#CC4444' },
      actuator_blocks: { colourPrimary: '#4ECDC4', colourSecondary: '#3EB7AE', colourTertiary: '#2E9B94' },
    },
  });
};


