import { useCourseManifest } from './hooks/useCourseManifest';
import { MainLayout } from './components/layout/MainLayout';
import { QuizView } from './components/tasks/QuizView';
import { TaskContainer } from './components/tasks/TaskContainer';
import { AuthProvider } from './core/auth/authContext';

export function App() {
  const {
    manifest,
    currentLessonId,
    lessonData,
    isLoadingLesson,
    selectLesson,
    getNextLessonId,
    getPrevLessonId,
  } = useCourseManifest();

  const nextId = getNextLessonId();
  const prevId = getPrevLessonId();

  const handleNext = () => {
    if (nextId) selectLesson(nextId);
  };

  const handlePrev = () => {
    if (prevId) selectLesson(prevId);
  };

  const handleRunExample = (code: string) => {
    navigator.clipboard?.writeText(code);
    alert(`Код скопирован в буфер обмена!\n\n${code}\n\nВставьте его в редактор в разделе «Практика» для запуска.`);
  };

  return (
    <AuthProvider>
      <MainLayout
        manifest={manifest}
        currentLessonId={currentLessonId}
        lessonData={lessonData}
        isLoadingLesson={isLoadingLesson}
        onSelectLesson={selectLesson}
        onNextLesson={handleNext}
        onPrevLesson={handlePrev}
        hasNextLesson={!!nextId}
        hasPrevLesson={!!prevId}
        onRunExample={handleRunExample}
        renderTasksArea={(activeTaskIndex, onSelectTaskIndex, onGoToQuiz) => (
          <TaskContainer
            tasks={lessonData?.tasks || []}
            lessonId={currentLessonId}
            activeTaskIndex={activeTaskIndex}
            onSelectTaskIndex={onSelectTaskIndex}
            onGoToQuiz={onGoToQuiz}
          />
        )}
        renderQuizArea={() => (
          <QuizView
            questions={lessonData?.quiz || []}
            lessonId={currentLessonId}
          />
        )}
      />
    </AuthProvider>
  );
}

export default App;
