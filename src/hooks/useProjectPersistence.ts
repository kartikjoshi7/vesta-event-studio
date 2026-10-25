/**
 * @fileoverview Persistent project storage and active selection hook for Vesta Event Studio.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EventProject } from '../types/event';
import { allPersonas } from '../data/verticalPersonas';
import { safeJsonParse } from '../utils/security';

const STORAGE_KEY_PROJECTS = 'vesta_event_studio_projects_v1';
const STORAGE_KEY_ACTIVE_ID = 'vesta_event_studio_active_id_v1';

function loadInitialProjects(): EventProject[] {
  if (typeof window === 'undefined') return allPersonas;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) return allPersonas;
    const parsed = safeJsonParse<EventProject[]>(raw, []);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : allPersonas;
  } catch {
    return allPersonas;
  }
}

function loadInitialActiveId(projects: EventProject[]): string {
  if (typeof window === 'undefined') return projects[0]?.id || '';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved && projects.some((p) => p.id === saved)) return saved;
  } catch {
    // Ignore storage issues
  }
  return projects[0]?.id || '';
}

export function useProjectPersistence() {
  const [projects, setProjects] = useState<EventProject[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => loadInitialActiveId(projects));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {
      // Quota exceeded fallback
    }
  }, [projects]);

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProjectId);
      }
    } catch {
      // Ignore
    }
  }, [activeProjectId]);

  const activeProject = useMemo<EventProject>(() => {
    const match = projects.find((p) => p.id === activeProjectId);
    return match || projects[0] || allPersonas[0];
  }, [projects, activeProjectId]);

  const updateActiveProject = useCallback(
    (updater: (prev: EventProject) => EventProject) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === activeProject.id ? updater(p) : p)),
      );
    },
    [activeProject.id],
  );

  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    } catch {
      // Ignore
    }
    setProjects(allPersonas);
    setActiveProjectId(allPersonas[0].id);
  }, []);

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    updateActiveProject,
    resetDemoData,
  };
}
