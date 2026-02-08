
/**
 * @fileoverview Theme configuration and utility functions.
 * Defines the design system tokens and helper functions for color manipulation.
 */

/**
 * Atlassian Design System Color Palette.
 * These hex codes match the Tailwind configuration in index.html.
 * Use these constants when inline styles or JS-driven logic is required.
 */
export const colors = {
  // Neutrals
  n0: '#FFFFFF',
  n10: '#FAFBFC',
  n20: '#F4F5F7',
  n30: '#EBECF0',
  n40: '#DFE1E6',
  n50: '#C1C7D0',
  n90: '#97A0AF',
  n100: '#7A869A',
  n200: '#6B778C',
  n300: '#5E6C84',
  n500: '#42526E',
  n800: '#172B4D',
  n900: '#091E42',

  // Blues
  b50: '#DEEBFF',
  b200: '#4C9AFF',
  b400: '#0052CC',
  b500: '#0747A6',

  // Greens
  g50: '#E3FCEF',
  g200: '#36B37E',
  g400: '#006644',

  // Reds
  r50: '#FFEBE6',
  r400: '#DE350B',
  r500: '#BF2600',

  // Yellows
  y50: '#FFF0B3',
  y400: '#FF991F',
  
  // Purples
  p50: '#EAE6FF',
  p400: '#6554C0',
  p500: '#403294',
};

/**
 * Returns the theme color palette for a given column type.
 * 
 * @param {string} theme - The theme key (e.g., 'green', 'red').
 * @returns {Object} Object containing Tailwind class strings for bg, text, and border.
 */
export const getThemeColors = (theme: string) => {
    switch (theme) {
      // Use g200/r300/b100/p100/y400/n50 to ensure tokens exist in index.html config
      case 'green': return { bg: 'bg-g50', text: 'text-g400', border: 'border-g200' };
      case 'red': return { bg: 'bg-r50', text: 'text-r500', border: 'border-r300' }; // r300 is closest to a border color in this set
      case 'blue': return { bg: 'bg-b50', text: 'text-b500', border: 'border-b100' };
      case 'yellow': return { bg: 'bg-y50', text: 'text-n800', border: 'border-y400' };
      case 'purple': return { bg: 'bg-p50', text: 'text-p500', border: 'border-p100' };
      default: return { bg: 'bg-n20', text: 'text-n800', border: 'border-n40' };
    }
};

/**
 * Extracts a list of unique authors from a collection of items.
 * Used for filtering and grouping views.
 * 
 * @param {Array} items - The list of retro items.
 * @returns {Array} List of unique author objects with name and color.
 */
export const getUniqueAuthors = (items: {author_name?: string; author_color?: string}[]) => {
    const map = new Map<string, {name: string, color: string}>();
    items.forEach(i => {
        const name = i.author_name || 'Unknown';
        if (!map.has(name)) {
            map.set(name, { name, color: i.author_color || colors.n40 });
        }
    });
    return Array.from(map.values());
};
