/**
 * @fileoverview Form inputs for bespoke event creation modal.
 */

import React from 'react';
import { Calendar, MapPin, Users, Coins } from 'lucide-react';
import type { EventProject } from '../../types/event';

interface NewProjectFormFieldsProps {
  title: string;
  onTitleChange: (v: string) => void;
  host: string;
  onHostChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  guests: string;
  onGuestsChange: (v: string) => void;
  budget: string;
  onBudgetChange: (v: string) => void;
  setting: 'indoor' | 'outdoor' | 'hybrid';
  onSettingChange: (v: 'indoor' | 'outdoor' | 'hybrid') => void;
  season: EventProject['season'];
  onSeasonChange: (v: EventProject['season']) => void;
}

export const NewProjectFormFields: React.FC<NewProjectFormFieldsProps> = ({
  title,
  onTitleChange,
  host,
  onHostChange,
  date,
  onDateChange,
  location,
  onLocationChange,
  guests,
  onGuestsChange,
  budget,
  onBudgetChange,
  setting,
  onSettingChange,
  season,
  onSeasonChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-title" className="block text-xs font-medium text-vesta-text mb-1">
            Event Title
          </label>
          <input
            id="new-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Royal Heritage Sangeet"
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="new-host" className="block text-xs font-medium text-vesta-text mb-1">
            Host / Client Name
          </label>
          <input
            id="new-host"
            type="text"
            value={host}
            onChange={(e) => onHostChange(e.target.value)}
            placeholder="e.g. Sharma Family"
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-date" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-vesta-iris" />
            <span>Target Date</span>
          </label>
          <input
            id="new-date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="new-location" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-vesta-iris" />
            <span>City / Venue</span>
          </label>
          <input
            id="new-location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Udaipur, Rajasthan"
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-guests" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-vesta-iris" />
            <span>Guest Count</span>
          </label>
          <input
            id="new-guests"
            type="number"
            min="1"
            max="50000"
            value={guests}
            onChange={(e) => onGuestsChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="new-budget" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-vesta-gold" />
            <span>Total Budget (INR)</span>
          </label>
          <input
            id="new-budget"
            type="number"
            step="10000"
            min="10000"
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-setting" className="block text-xs font-medium text-vesta-text mb-1">
            Venue Environment
          </label>
          <select
            id="new-setting"
            value={setting}
            onChange={(e) => onSettingChange(e.target.value as 'indoor' | 'outdoor' | 'hybrid')}
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          >
            <option value="indoor">Indoor (Ballroom / Banquet)</option>
            <option value="outdoor">Outdoor (Lawn / Beach)</option>
            <option value="hybrid">Hybrid (Courtyard + Hall)</option>
          </select>
        </div>
        <div>
          <label htmlFor="new-season" className="block text-xs font-medium text-vesta-text mb-1">
            Season
          </label>
          <select
            id="new-season"
            value={season}
            onChange={(e) => onSeasonChange(e.target.value as EventProject['season'])}
            className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="monsoon">Monsoon</option>
            <option value="autumn">Autumn</option>
            <option value="winter">Winter</option>
          </select>
        </div>
      </div>
    </>
  );
};
