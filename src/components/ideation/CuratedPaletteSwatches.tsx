import React, { useState } from 'react';
import { Palette, Copy, Check } from 'lucide-react';
import type { EventVertical } from '../../types/event';
import { palettesByVertical } from '../../data/fixtures/palettes';

interface CuratedPaletteSwatchesProps {
  vertical: EventVertical;
}

export const CuratedPaletteSwatches: React.FC<CuratedPaletteSwatchesProps> = ({ vertical }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const currentPalette = palettesByVertical[vertical] || palettesByVertical.wedding;

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2500);
    } catch {
      // Fallback in environments without clipboard permissions
    }
  };

  return (
    <section
      aria-label="Curated Event Color Palette"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-vesta-gold/20 text-vesta-gold border border-vesta-gold/30">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-vesta-text">
              Curated Event Color Palette ({vertical.toUpperCase()})
            </h2>
            <p className="text-xs text-vesta-muted">
              Harmonious hex color tokens tailored to this celebration aesthetic. Click any swatch to copy.
            </p>
          </div>
        </div>

        <div aria-live="polite" className="text-xs text-vesta-success font-mono">
          {copiedHex && `Copied ${copiedHex} to clipboard!`}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {currentPalette.map((swatch, idx) => {
          const isCopied = copiedHex === swatch.hex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopyHex(swatch.hex)}
              aria-label={`Copy hex code ${swatch.hex} for ${swatch.name}`}
              className="p-3 rounded-2xl bg-vesta-surface/90 border border-vesta-border hover:border-vesta-iris/40 transition-all text-left space-y-2.5 group focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <div
                className="w-full h-12 rounded-xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform flex items-end justify-end p-1.5"
                style={{ backgroundColor: swatch.hex }}
              >
                <span className="p-1 rounded-md bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopied ? <Check className="w-3 h-3 text-vesta-success" /> : <Copy className="w-3 h-3" />}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-gold transition-colors truncate">
                  {swatch.name}
                </div>
                <div className="text-[10px] font-mono text-vesta-foam mt-0.5">
                  {swatch.hex}
                </div>
                <div className="text-[9px] text-vesta-muted uppercase tracking-wider mt-0.5 truncate">
                  {swatch.role}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
