'use client';

import React, { useState } from 'react';
import { useGetMathQuestionsQuery } from '../../redux/services/mathApi';
import MathRender from '../../components/MathRender';

export default function MathPage() {
  const { data: questions, isLoading, error } = useGetMathQuestionsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-gray-600">Loading math questions...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-red-500">Error loading questions. Please try again later.</div></div>;
  if (!questions || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-gray-600">No questions found.</div></div>;

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Math Challenge</h2>
          <p className="text-center text-gray-500 text-sm">Question {currentIndex + 1} of {questions.length}</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg text-lg text-gray-800 text-center min-h-[120px] flex items-center justify-center shadow-inner">
            <MathRender text={currentQuestion.text} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "p-4 border-2 rounded-lg transition-all text-center hover:bg-gray-100 flex items-center justify-center min-h-[80px] text-gray-700 bg-white";

              if (showResult) {
                if (index === currentQuestion.correct_option_index) {
                  buttonClass = "p-4 border-2 border-green-500 bg-green-50 rounded-lg text-center flex items-center justify-center min-h-[80px] text-green-700 font-medium shadow-sm";
                } else if (index === selectedOption) {
                  buttonClass = "p-4 border-2 border-red-500 bg-red-50 rounded-lg text-center flex items-center justify-center min-h-[80px] text-red-700 shadow-sm";
                }
              } else if (selectedOption === index) {
                buttonClass = "p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-center flex items-center justify-center min-h-[80px]";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <MathRender text={option} />
                </button>
              );
            })}
          </div>
        </div>

        {showResult && (
          <div className="flex justify-center mt-6 animate-fade-in-up">
            <button
              onClick={nextQuestion}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform transition hover:scale-105"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Start Over'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
