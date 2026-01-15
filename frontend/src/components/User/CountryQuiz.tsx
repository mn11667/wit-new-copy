import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';

interface Country {
    name: {
        common: string;
        official: string;
    };
    capital?: string[];
    population: number;
    region: string;
    flags: {
        svg: string;
        png: string;
    };
    cca2: string;
}

type QuestionType = 'flag' | 'capital' | 'population' | 'region';

interface QuizQuestion {
    type: QuestionType;
    correctCountry: Country;
    options: Country[];
    question: string;
}

export const CountryQuiz: React.FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);

    // Fetch all countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all');

                if (!res.ok) {
                    throw new Error(`API returned ${res.status}`);
                }

                const data = await res.json();

                // Validate and filter countries with required properties
                const validCountries = data.filter((country: any) =>
                    country.name?.common &&
                    country.cca2 &&
                    country.flags?.svg &&
                    country.population &&
                    country.region
                );

                if (validCountries.length < 4) {
                    throw new Error('Not enough valid countries data');
                }

                setCountries(validCountries);
                setError(null);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch countries', err);
                setError(err.message || 'Failed to load countries');
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    const generateQuestion = React.useCallback(() => {
        if (countries.length < 4) return;

        // Pick random question type
        const types: QuestionType[] = ['flag', 'capital', 'population', 'region'];
        const questionType = types[Math.floor(Math.random() * types.length)];

        // Pick random correct country
        const correctCountry = countries[Math.floor(Math.random() * countries.length)];

        // Generate 3 random wrong answers
        const wrongCountries: Country[] = [];
        while (wrongCountries.length < 3) {
            const random = countries[Math.floor(Math.random() * countries.length)];
            if (random.cca2 !== correctCountry.cca2 && !wrongCountries.find(c => c.cca2 === random.cca2)) {
                wrongCountries.push(random);
            }
        }

        // Shuffle options
        const options = [correctCountry, ...wrongCountries].sort(() => Math.random() - 0.5);

        // Generate question text
        let question = '';
        switch (questionType) {
            case 'flag':
                question = 'Which country does this flag belong to?';
                break;
            case 'capital':
                question = `What is the capital of ${correctCountry.name.common}?`;
                break;
            case 'population':
                question = `What is the approximate population of ${correctCountry.name.common}?`;
                break;
            case 'region':
                question = `Which region is ${correctCountry.name.common} located in?`;
                break;
        }

        setCurrentQuestion({
            type: questionType,
            correctCountry,
            options,
            question
        });
        setRevealed(false);
        setSelectedAnswer(null);
    }, [countries]);

    // Generate initial question when countries are loaded
    useEffect(() => {
        if (countries.length > 0 && !currentQuestion) {
            generateQuestion();
        }
    }, [countries, currentQuestion, generateQuestion]);

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        setRevealed(true);

        const isCorrect = currentQuestion?.options[index].cca2 === currentQuestion?.correctCountry.cca2;
        if (isCorrect) {
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }
    };

    const formatPopulation = (pop: number): string => {
        if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
        if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
        if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
        return pop.toString();
    };

    const renderQuestionContent = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.type) {
            case 'flag':
                return (
                    <div className="mb-6 flex justify-center">
                        <img
                            src={currentQuestion.correctCountry.flags.svg}
                            alt="Country flag"
                            className="w-full max-w-sm h-48 object-contain rounded-xl border-2 border-white/10 shadow-lg"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderOptions = () => {
        if (!currentQuestion) return null;

        return currentQuestion.options.map((country, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = country.cca2 === currentQuestion.correctCountry.cca2;

            let btnClass = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 p-4 text-lg";

            if (revealed) {
                if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500/50 p-4 text-lg font-bold";
                else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-100 p-4 text-lg";
                else btnClass = "opacity-40 border-transparent bg-black/20 p-4";
            }

            let optionText = '';
            switch (currentQuestion.type) {
                case 'flag':
                    optionText = country.name.common;
                    break;
                case 'capital':
                    optionText = country.capital?.[0] || 'Unknown';
                    break;
                case 'population':
                    optionText = formatPopulation(country.population);
                    break;
                case 'region':
                    optionText = country.region;
                    break;
            }

            return (
                <button
                    key={idx}
                    onClick={() => !revealed && handleAnswer(idx)}
                    disabled={revealed}
                    className={`w-full text-left rounded-xl border transition-all duration-200 flex items-center gap-4 group ${btnClass} ${!revealed && 'hover:scale-[1.01] active:scale-[0.99]'}`}
                >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold opacity-60 ${revealed && isCorrect ? 'bg-emerald-500 text-black border-emerald-500 opacity-100' : 'border-white/20'}`}>
                        {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{optionText}</span>
                </button>
            );
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-purple-300 animate-pulse">Loading Countries...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-red-400 text-center">
                    <p className="text-lg font-bold mb-2">⚠️ Failed to Load</p>
                    <p className="text-sm text-slate-400">{error}</p>
                    <p className="text-xs text-slate-500 mt-2">The countries API might be temporarily unavailable</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                    className="mt-4"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm font-mono">
                    Streak: {streak} 🔥
                </div>
            </div>

            {currentQuestion && (
                <>
                    <div className="mb-6">
                        <p className="text-2xl text-white font-medium leading-relaxed text-center mb-4">
                            {currentQuestion.question}
                        </p>
                    </div>

                    {renderQuestionContent()}

                    <div className="grid gap-3 mb-8 w-full">
                        {renderOptions()}
                    </div>

                    {revealed && (
                        <div className={`p-4 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2 border ${selectedAnswer !== null && currentQuestion.options[selectedAnswer].cca2 === currentQuestion.correctCountry.cca2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                            <p className="text-lg font-bold mb-2">
                                {selectedAnswer !== null && currentQuestion.options[selectedAnswer].cca2 === currentQuestion.correctCountry.cca2 ? "Correct! 🎉" : "Incorrect ❌"}
                            </p>
                            <div className="text-sm opacity-80 space-y-1">
                                <p><strong>Country:</strong> {currentQuestion.correctCountry.name.common}</p>
                                {currentQuestion.correctCountry.capital && (
                                    <p><strong>Capital:</strong> {currentQuestion.correctCountry.capital[0]}</p>
                                )}
                                <p><strong>Population:</strong> {formatPopulation(currentQuestion.correctCountry.population)}</p>
                                <p><strong>Region:</strong> {currentQuestion.correctCountry.region}</p>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="mt-auto pt-4 border-t border-white/5">
                <Button
                    variant="primary"
                    className="w-full py-4 text-lg shadow-xl shadow-blue-900/20"
                    onClick={generateQuestion}
                >
                    {currentQuestion && revealed ? "Next Question ➡️" : "Start Quiz 🚀"}
                </Button>
            </div>
        </div>
    );
};
