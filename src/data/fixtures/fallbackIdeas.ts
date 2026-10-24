/**
 * @fileoverview Fallback ideas fixture data and generator for Vesta Event Studio.
 */

import type { EventProject, PersonalizedIdea } from '../../types/event';

export function createLocalFallbackIdeas(project: EventProject): PersonalizedIdea[] {
  const uid = () => `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const ideaBank: Record<string, PersonalizedIdea[]> = {
    wedding: [
      {
        id: uid(),
        category: 'theme',
        title: 'Moonlit Garden Ceremony',
        description: `Transform your ${project.location} venue into an enchanted moonlit garden with fairy lights, white florals, and mirror-topped tables reflecting candlelight. Ideal for your ${project.season} ${project.indoorOutdoor} setting.`,
        estimatedCostImpact: '+₹35,000',
        bestForContext: `${project.season} ${project.indoorOutdoor} weddings in ${project.location}`,
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'catering',
        title: 'Regional Cuisine Tasting Journey',
        description: `Curate a multi-station tasting experience featuring regional cuisines from ${project.location} and the couple's heritage cities. Each station tells a story with custom menu cards.`,
        estimatedCostImpact: '+₹20,000',
        bestForContext: `Weddings with ${project.guestCount}+ guests celebrating cultural heritage`,
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'sustainability',
        title: 'Seed Paper Invitations',
        description:
          'Replace traditional paper invites with plantable seed paper that grows into wildflowers. Include QR codes linking to the wedding website for RSVP.',
        estimatedCostImpact: 'Budget-neutral',
        bestForContext: 'Eco-conscious couples, any venue type',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'entertainment',
        title: 'Live Caricature Artists',
        description: `Station 2 caricature artists at the reception to sketch guests as wedding keepsakes. A fun, personal alternative to traditional party favors for ${project.guestCount} guests.`,
        estimatedCostImpact: '+₹15,000',
        bestForContext: 'Wedding receptions with 150+ guests',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'decor',
        title: 'Vintage Photo Timeline Display',
        description:
          "Create a chronological photo display tracing the couple's journey from childhood to engagement, arranged along the entrance pathway with floral framing.",
        estimatedCostImpact: '+₹8,000',
        bestForContext: 'Heritage & traditional themed weddings',
        appliedToPlan: false,
      },
    ],
    birthday: [
      {
        id: uid(),
        category: 'entertainment',
        title: 'Mystery Guest Performer',
        description: `Surprise the birthday host with a 15-minute set from a local musician matching the ${project.vibeTags.join('/')} vibe. Coordinate secretly with close friends for maximum impact.`,
        estimatedCostImpact: '+₹12,000',
        bestForContext: `Milestone birthdays with ${project.vibeTags.join(', ')} aesthetic`,
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'theme',
        title: 'Decade Throwback Experience',
        description: `Since ${project.personaName} is turning a milestone, create themed zones representing each decade of their life with era-appropriate music, décor, and photo props.`,
        estimatedCostImpact: '+₹10,000',
        bestForContext: 'Milestone birthdays (30th, 40th, 50th)',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'catering',
        title: 'Dessert Grazing Table',
        description: `Create a stunning 10-foot dessert grazing table with artisanal chocolates, macarons, fruit tarts, and the birthday cake as the centrepiece. Accommodates all ${project.dietaryRestrictions.join(', ')} dietary needs.`,
        estimatedCostImpact: '+₹7,000',
        bestForContext: 'Premium parties with dietary considerations',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'decor',
        title: 'Personalized Neon Sign',
        description: `Commission a custom neon sign with "${project.personaName}'s" name or a signature catchphrase. Doubles as the main photo backdrop and a take-home keepsake.`,
        estimatedCostImpact: '+₹6,000',
        bestForContext: 'Neon, rooftop, or nightlife-themed parties',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'logistics',
        title: 'Coordinated Arrival Experience',
        description: `Arrange branded ride-share credits for all ${project.guestCount} guests with a custom pick-up message. Ensures safe transport and creates a VIP arrival experience.`,
        estimatedCostImpact: '+₹8,000',
        bestForContext: 'Urban nightlife parties, safety-conscious hosts',
        appliedToPlan: false,
      },
    ],
    community: [
      {
        id: uid(),
        category: 'logistics',
        title: 'Hybrid Livestream with Live Q&A',
        description: `Set up professional livestreaming for the keynote sessions, enabling remote attendees to participate via live chat Q&A. Extend the reach of your ${project.guestCount}-person summit to a global audience.`,
        estimatedCostImpact: '+₹25,000',
        bestForContext: 'Tech summits and professional conferences',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'sustainability',
        title: 'Digital-Only Swag Bags',
        description:
          'Replace physical swag with digital goodie bags: discount codes, e-books, free software trials, and exclusive content from sponsors. Zero waste, high value.',
        estimatedCostImpact: '-₹15,000 saved',
        bestForContext: 'Sustainability-focused events, tech-savvy attendees',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'entertainment',
        title: 'Speed Networking Rounds',
        description: `Organize 3 rounds of structured speed networking (5 min each) during the tea break. Use topic-based table assignments to maximize meaningful connections among ${project.guestCount} attendees.`,
        estimatedCostImpact: 'Budget-neutral',
        bestForContext: 'Professional networking events with 200+ attendees',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'catering',
        title: 'Local Food Truck Alley',
        description: `Instead of traditional buffet, invite 4-5 local food trucks to create a vibrant "Food Truck Alley" during lunch. Supports local businesses and adds variety for ${project.guestCount} attendees.`,
        estimatedCostImpact: '+₹5,000',
        bestForContext: 'Community events in cities with active food truck culture',
        appliedToPlan: false,
      },
      {
        id: uid(),
        category: 'theme',
        title: 'Impact Wall & Pledge Board',
        description:
          'Set up a large interactive "Impact Wall" where attendees write sustainability pledges on post-it notes. Photograph and compile into a post-event impact report shared with all attendees.',
        estimatedCostImpact: '+₹2,000',
        bestForContext: 'Sustainability summits and community gatherings',
        appliedToPlan: false,
      },
    ],
  };

  return ideaBank[project.vertical] ?? ideaBank.wedding;
}
