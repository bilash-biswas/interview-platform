'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetExamDetailsQuery, useGetExamQuestionsQuery, useSubmitExamAnswersMutation } from '@/redux/services/examApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

export default function ExamArenaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: exam, isLoading: loadingExam } = useGetExamDetailsQuery(id as string);
  const { data: questions, isLoading: loadingQuestions } = useGetExamQuestionsQuery(id as string);
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitExamAnswersMutation();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (exam) {
      const now = new Date().getTime();
      const start = new Date(exam.startTime).getTime();
      const end = start + exam.totalTime * 60 * 1000;

      if (now < start) {
        const diff = Math.floor((start - now) / 1000);
        setTimeLeft(diff);
      } else if (now < end) {
        setIsStarted(true);
        setTimeLeft(Math.floor((end - now) / 1000));
      } else {
        setTimeLeft(0);
      }
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isStarted) handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isStarted]);

  const handleAutoSubmit = async () => {
    handleSubmit();
  };

  const handleSelect = (optionIdx: number) => {
    setAnswers({
      ...answers,
      [questions![currentIdx]._id]: optionIdx
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await submitAnswers({
        examId: id as string,
        body: {
          studentId: user.id,
          username: user.username,
          answers,
          timeSpent: exam!.totalTime * 60 - timeLeft
        }
      }).unwrap();
      router.push(`/exams/${id}/rankings`);
    } catch (err) {
      alert('Submission failed');
    }
  };

  if (loadingExam || loadingQuestions) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-black text-3xl animate-pulse tracking-tightest">LOADING <span className="text-arena-blue italic ml-2">DATASTREAM...</span></div>;

  if (!isStarted && timeLeft > 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-arena-blue/5 blur-[150px] -z-10 pointer-events-none" />

        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-arena-blue/20 bg-arena-blue/5 text-arena-blue text-[10px] font-black uppercase tracking-[0.2em]">
            Deployment Pending
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tightest leading-none">PREPARE FOR <br /><span className="text-arena-blue italic">BATTLE</span></h1>
          <p className="text-2xl md:text-4xl font-mono text-foreground font-black tracking-widest px-8 py-4 glass-panel rounded-2xl border-arena-blue/30 inline-block animate-pulse">
            T-MINUS: {Math.floor(timeLeft / 3600)}H {Math.floor((timeLeft % 3600) / 60)}M {timeLeft % 60}S
          </p>
        </div>

        <div className="max-w-xl w-full glass-panel p-10 md:p-12 rounded-[3.5rem] relative overflow-hidden group hover:border-arena-blue/50 transition-all duration-700">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-arena-blue to-transparent opacity-50" />

          <h2 className="text-3xl font-black mb-6 leading-tight">{exam?.title}</h2>
          <p className="opacity-50 font-bold mb-10 leading-relaxed text-lg">{exam?.description}</p>

          <div className="grid grid-cols-3 gap-6 text-center border-t border-border-arena pt-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 font-black">Modules</p>
              <p className="text-2xl font-black text-arena-blue">{exam?.questionCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Window</p>
              <p className="text-2xl font-black text-arena-blue">{exam?.totalTime}m</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Penalty</p>
              <p className="text-2xl font-black text-pink-500">-{exam?.negativeMarkingValue}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (timeLeft === 0 && !isStarted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center space-y-10">
        <div className="w-24 h-24 rounded-full border-4 border-red-500/50 flex items-center justify-center text-5xl">🛑</div>
        <h1 className="text-6xl font-black tracking-tightest">ARENA <br /><span className="text-red-500 italic">CLOSED</span></h1>
        <p className="text-xl font-bold opacity-40 uppercase tracking-widest max-w-md mx-auto">The deployment window for this sector has concluded. Report to HQ for status.</p>

        <Link
          href={`/exams/${id}/rankings`}
          className="bg-foreground text-background font-black px-12 py-5 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-sm shadow-xl shadow-foreground/10"
        >
          View Rankings
        </Link>
      </div>
    );
  }

  const currentQ = questions![currentIdx];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Arena Header */}
        <div className="glass-panel p-8 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-arena-blue/10 text-arena-blue text-[10px] font-black uppercase tracking-widest">Live Deployment</div>
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase">{exam?.title}</h1>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mt-2">Analysis Hub <span className="mx-2">•</span> Question {currentIdx + 1} of {questions?.length}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Time To Expiration</p>
              <div className="font-mono text-3xl font-black text-arena-blue glow-blue">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border-arena flex items-center justify-center text-2xl font-black">
              ⚡
            </div>
          </div>
        </div>

        {/* Tactical Question Visualizer */}
        <div className="glass-panel p-10 md:p-14 rounded-[4rem] relative overflow-hidden flex-1 group transition-all duration-500 border-transparent hover:border-arena-blue/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-arena-blue/5 blur-[120px] pointer-events-none" />

          <div className="flex items-center gap-4 mb-10 opacity-30">
            <div className="w-2 h-2 rounded-full bg-arena-blue animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Decryption Phase</span>
            <div className="flex-1 h-[1px] bg-foreground/10" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-16 leading-[1.1] tracking-tightest max-w-4xl">
            {currentQ.text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQ.options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`group relative text-left p-8 rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${answers[currentQ._id] === idx
                  ? 'bg-arena-blue/10 border-arena-blue shadow-xl shadow-blue-500/10'
                  : 'glass-panel border-transparent hover:border-foreground/20'
                  }`}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-sm border transition-all ${answers[currentQ._id] === idx
                    ? 'bg-arena-blue text-white border-transparent rotate-[360deg]'
                    : 'bg-foreground/5 border-border-arena group-hover:bg-foreground/10'
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-xl font-bold transition-all ${answers[currentQ._id] === idx ? 'text-arena-blue' : 'opacity-80'}`}>
                    {option}
                  </span>
                </div>
                {answers[currentQ._id] === idx && (
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-arena-blue/5 to-transparent pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Immersive Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
          <div className="flex gap-4 w-full md:w-auto">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex-1 md:flex-none px-10 py-5 glass-panel rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] disabled:opacity-20 hover:bg-foreground/5 transition-all active:scale-95"
            >
              Backtrack
            </button>

            <div className="hidden lg:flex items-center gap-2 px-6">
              {questions?.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i < currentIdx ? 'bg-arena-blue/40' : i === currentIdx ? 'bg-arena-blue scale-150 glow-blue' : 'bg-foreground/10'
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto">
            {currentIdx === questions!.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto px-16 py-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black rounded-3xl transition-all shadow-2xl shadow-green-500/20 uppercase tracking-[0.2em] text-sm hover:scale-[1.05] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting Data...' : 'Finalize Mission'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="w-full md:w-auto px-16 py-6 bg-arena-blue hover:bg-blue-600 text-white font-black rounded-3xl transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-[0.2em] text-sm hover:scale-[1.05] active:scale-95"
              >
                Proceed to Question
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
