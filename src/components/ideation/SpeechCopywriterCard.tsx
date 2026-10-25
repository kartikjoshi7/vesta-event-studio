import React, { useState } from 'react';
import { FileText, Mail, Mic, Copy, Check } from 'lucide-react';
import type { EventProject } from '../../types/event';

interface SpeechCopywriterCardProps {
  project: EventProject;
}

export const SpeechCopywriterCard: React.FC<SpeechCopywriterCardProps> = ({ project }) => {
  const [copywriterMode, setCopywriterMode] = useState<'invitation' | 'toast'>('invitation');
  const [copiedCopyText, setCopiedCopyText] = useState(false);

  const dateObj = project.date.includes('T') ? new Date(project.date) : new Date(`${project.date}T12:00:00`);
  const formattedDate = isNaN(dateObj.getTime())
    ? project.date
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const generatedInvitationText =
    project.vertical === 'wedding'
      ? `✨ Together with their families,\n${project.personaName} cordially invite you to celebrate the joyous union of\n${project.title}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n👗 Dress Code / Vibe: ${project.vibeTags.join(', ')}\n\nKindly RSVP to celebrate love, tradition, and eternal memories.`
      : project.vertical === 'birthday'
      ? `🎉 You're invited to celebrate!\nJoin us for ${project.title} hosted by ${project.personaName}!\n\n📅 Date: ${formattedDate}\n📍 Location: ${project.location}\n🍸 Atmosphere: ${project.vibeTags.join(' · ')}\n\nGet ready for extraordinary music, bespoke drinks, and an unforgettable celebration. RSVP today!`
      : `🌱 You are invited to attend:\n${project.title}\nConvened by ${project.personaName}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n🎯 Theme: ${project.vibeTags.join(' | ')}\n\nJoin 500+ leaders, innovators, and sustainability champions for impactful keynotes, interactive exhibits, and collaborative networking. Register your badge now!`;

  const generatedToastText =
    project.vertical === 'wedding'
      ? `Dear family and distinguished friends,\n\nStanding here today for ${project.title}, my heart is filled with gratitude. To everyone who traveled from near and far to ${project.location} to be with ${project.personaName}—thank you. May this celebration be blessed with laughter, timeless rituals, and a lifetime of happiness.\n\nPlease raise your glasses with me to love, family, and new beginnings!`
      : project.vertical === 'birthday'
      ? `Welcome everyone!\n\nThank you for turning up tonight to celebrate ${project.title}! Looking around this rooftop, seeing all our favorite people together in ${project.location} means the world to ${project.personaName}.\n\nHere is to milestone memories, bold dreams, and dancing until the sunrise. Cheers!`
      : `Honored delegates, keynote speakers, and partners,\n\nWelcome to ${project.title}. Today in ${project.location}, we gather with a shared mission: shaping sustainable technology for our collective future. Over the next full day, let us challenge assumptions, forge lasting partnerships, and turn vision into measurable action.\n\nThank you for your leadership and participation!`;

  const activeCopyContent =
    copywriterMode === 'invitation' ? generatedInvitationText : generatedToastText;

  const handleCopyCopywriterText = async () => {
    try {
      await navigator.clipboard.writeText(activeCopyContent);
      setCopiedCopyText(true);
      setTimeout(() => setCopiedCopyText(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <section
      aria-label="AI Copywriter"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30">
            <FileText className="w-4 h-4 text-vesta-gold" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-vesta-text">
              AI Invitation & Toast Speech Copywriter
            </h2>
            <p className="text-xs text-vesta-muted">
              Synthesizes tone-matched guest invitation copy and keynote toast speeches tailored to your event details.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div role="tablist" aria-label="Copywriter format selection" className="flex items-center gap-1.5 p-1 rounded-xl bg-vesta-surface border border-vesta-border">
          <button
            type="button"
            role="tab"
            aria-selected={copywriterMode === 'invitation'}
            onClick={() => setCopywriterMode('invitation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              copywriterMode === 'invitation'
                ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-sm'
                : 'text-vesta-muted hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Guest Invitation</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={copywriterMode === 'toast'}
            onClick={() => setCopywriterMode('toast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              copywriterMode === 'toast'
                ? 'bg-vesta-card text-vesta-iris border border-vesta-iris/30 shadow-sm'
                : 'text-vesta-muted hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Host Toast Speech</span>
          </button>
        </div>
      </div>

      {/* Copywriter Text Area */}
      <div className="relative">
        <label htmlFor="copywriter-textarea" className="sr-only">
          Generated {copywriterMode === 'invitation' ? 'Guest Invitation' : 'Host Toast Speech'}
        </label>
        <textarea
          id="copywriter-textarea"
          readOnly
          value={activeCopyContent}
          rows={7}
          className="w-full p-4 rounded-2xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-vesta-iris resize-none"
        />

        <button
          type="button"
          onClick={handleCopyCopywriterText}
          aria-label="Copy invitation or toast text to clipboard"
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vesta-card/90 hover:bg-vesta-border border border-vesta-border text-xs font-semibold text-vesta-text hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-vesta-iris"
        >
          {copiedCopyText ? (
            <>
              <Check className="w-3.5 h-3.5 text-vesta-success" />
              <span className="text-vesta-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-vesta-gold" />
              <span>Copy to Clipboard</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
