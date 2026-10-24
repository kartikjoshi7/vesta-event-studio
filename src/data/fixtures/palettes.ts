/**
 * @fileoverview Curated event color palettes fixture.
 */

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export const palettesByVertical: Record<string, ColorSwatch[]> = {
  wedding: [
    { name: 'Royal Crimson', hex: '#881337', role: 'Primary Accent' },
    { name: 'Marigold Gold', hex: '#D97706', role: 'Secondary Accent' },
    { name: 'Ivory Silk', hex: '#FDF4E3', role: 'Base Linen' },
    { name: 'Haveli Navy', hex: '#1E3A8A', role: 'Contrast Border' },
    { name: 'Forest Emerald', hex: '#065F46', role: 'Floral Foliage' },
  ],
  birthday: [
    { name: 'Rooftop Obsidian', hex: '#0F172A', role: 'Base Midnight' },
    { name: 'Neon Rose', hex: '#F43F5E', role: 'Vibrant Highlight' },
    { name: 'Electric Cyan', hex: '#06B6D4', role: 'Cocktail Glow' },
    { name: 'Deep Violet', hex: '#A855F7', role: 'DJ Stage Ambient' },
    { name: 'Laser Gold', hex: '#FACC15', role: 'Metallic Trim' },
  ],
  community: [
    { name: 'Eco Forest', hex: '#047857', role: 'Sustainability Primary' },
    { name: 'Sky Innovation', hex: '#0284C7', role: 'Tech Accent' },
    { name: 'Solar Amber', hex: '#F59E0B', role: 'Stage Warmth' },
    { name: 'Slate Neutral', hex: '#475569', role: 'Signage & Badges' },
    { name: 'Clean Pearl', hex: '#F8FAFC', role: 'Exhibit Floor' },
  ],
};
