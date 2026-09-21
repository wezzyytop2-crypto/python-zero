import { useState, useEffect, useCallback } from 'react';
import type { CourseManifest, LessonData } from '../types/course';
import { ProgressStore } from '../core/storage/progressStore';

export function useCourseManifest() {
  const [manifest, setManifest] = useState<CourseManifest | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>('lesson-1-1');
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isLoadingManifest, setIsLoadingManifest] = useState<boolean>(true);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load manifest once on mount
  useEffect(() => {
    async function loadManifest() {
      try {
        setIsLoadingManifest(true);
        const res = await fetch(`${import.meta.env.BASE_URL}content/manifest.json`);
        if (!res.ok) {
          throw new Error(`Не удалось загрузить структуру курса (HTTP ${res.status})`);
        }
        const data: CourseManifest = await res.json();
        setManifest(data);

        // Determine starting lesson: from URL hash or last visited or first lesson
        const hash = window.location.hash.replace('#', '');
        const lastVisited = ProgressStore.getProgress().lastVisitedLessonId;
        
        let initialLessonId = 'lesson-1-1';
        if (hash) {
          initialLessonId = hash;
        } else if (lastVisited) {
          initialLessonId = lastVisited;
        } else if (data.modules[0]?.lessons[0]?.id) {
          initialLessonId = data.modules[0].lessons[0].id;
        }

        setCurrentLessonId(initialLessonId);
      } catch (e: any) {
        console.error('Manifest load error:', e);
        setError(e.message || 'Ошибка загрузки курса');
      } finally {
        setIsLoadingManifest(false);
      }
    }

    loadManifest();
  }, []);

  // Listen to hash changes
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentLessonId) {
        setCurrentLessonId(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentLessonId]);

  // Load specific lesson data whenever currentLessonId changes
  useEffect(() => {
    if (!manifest || !currentLessonId) return;

    let isSubscribed = true;

    async function loadLesson() {
      try {
        setIsLoadingLesson(true);
        setError(null);

        // Find lesson meta in manifest
        let targetFile: string | null = null;
        for (const mod of manifest!.modules) {
          const l = mod.lessons.find(lesson => lesson.id === currentLessonId);
          if (l) {
            targetFile = l.file;
            break;
          }
        }

        if (!targetFile) {
          targetFile = `module-1/lesson-1-1.json`;
        }

        const res = await fetch(`${import.meta.env.BASE_URL}content/${targetFile}`);
        if (!res.ok) {
          throw new Error(`Не удалось загрузить урок ${currentLessonId}`);
        }

        const data: LessonData = await res.json();
        if (isSubscribed) {
          setLessonData(data);
          ProgressStore.setLastVisitedLesson(data.id);
          if (window.location.hash.replace('#', '') !== data.id) {
            window.location.hash = data.id;
          }
        }
      } catch (e: any) {
        if (isSubscribed) {
          console.error('Lesson load error:', e);
          setError(e.message || 'Ошибка загрузки урока');
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingLesson(false);
        }
      }
    }

    loadLesson();

    return () => {
      isSubscribed = false;
    };
  }, [manifest, currentLessonId]);

  const selectLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    window.location.hash = lessonId;
  }, []);

  // Navigation helpers: next / prev lesson
  const getNextLessonId = useCallback((): string | null => {
    if (!manifest) return null;
    const allLessons = manifest.modules.flatMap(m => m.lessons);
    const idx = allLessons.findIndex(l => l.id === currentLessonId);
    if (idx >= 0 && idx < allLessons.length - 1) {
      return allLessons[idx + 1].id;
    }
    return null;
  }, [manifest, currentLessonId]);

  const getPrevLessonId = useCallback((): string | null => {
    if (!manifest) return null;
    const allLessons = manifest.modules.flatMap(m => m.lessons);
    const idx = allLessons.findIndex(l => l.id === currentLessonId);
    if (idx > 0) {
      return allLessons[idx - 1].id;
    }
    return null;
  }, [manifest, currentLessonId]);

  return {
    manifest,
    currentLessonId,
    lessonData,
    isLoadingManifest,
    isLoadingLesson,
    error,
    selectLesson,
    getNextLessonId,
    getPrevLessonId,
  };
}
