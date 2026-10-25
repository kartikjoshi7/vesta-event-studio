/**
 * @fileoverview Invitation and toast speech copywriter engine for Vesta Event Studio.
 */

import type { EventProject } from '../../types/event';

export function generateEventInvitation(project: EventProject): string {
  const formattedDate = new Date(project.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (project.vertical === 'wedding') {
    return `✨ Together with their families,\n${project.personaName} cordially invite you to celebrate the joyous union of\n${project.title}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n👗 Dress Code / Vibe: ${project.vibeTags.join(', ')}\n\nKindly RSVP to celebrate love, tradition, and eternal memories.`;
  }
  if (project.vertical === 'birthday') {
    return `🎉 You're invited to celebrate!\nJoin us for ${project.title} hosted by ${project.personaName}!\n\n📅 Date: ${formattedDate}\n📍 Location: ${project.location}\n🍸 Atmosphere: ${project.vibeTags.join(' · ')}\n\nGet ready for extraordinary music, bespoke drinks, and an unforgettable celebration. RSVP today!`;
  }
  return `🌱 You are invited to attend:\n${project.title}\nConvened by ${project.personaName}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n🎯 Theme: ${project.vibeTags.join(' | ')}\n\nJoin 500+ leaders, innovators, and sustainability champions for impactful keynotes, interactive exhibits, and collaborative networking. Register your badge now!`;
}

export function generateEventToast(project: EventProject): string {
  if (project.vertical === 'wedding') {
    return `Dear family and distinguished friends,\n\nStanding here today for ${project.title}, my heart is filled with gratitude. To everyone who traveled from near and far to ${project.location} to be with ${project.personaName}—thank you. May this celebration be blessed with laughter, timeless rituals, and a lifetime of happiness.\n\nPlease raise your glasses with me to love, family, and new beginnings!`;
  }
  if (project.vertical === 'birthday') {
    return `Welcome everyone!\n\nThank you for turning up tonight to celebrate ${project.title}! Looking around this rooftop, seeing all our favorite people together in ${project.location} means the world to ${project.personaName}.\n\nHere is to milestone memories, bold dreams, and dancing until the sunrise. Cheers!`;
  }
  return `Honored delegates, keynote speakers, and partners,\n\nWelcome to ${project.title}. Today in ${project.location}, we gather with a shared mission: shaping sustainable technology for our collective future. Over the next full day, let us challenge assumptions, forge lasting partnerships, and turn vision into measurable action.\n\nThank you for your leadership and participation!`;
}
