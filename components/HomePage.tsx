
import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import Header from './Header';
import { SparkleIcon } from './icons/SparkleIcon';
import { XIcon } from './icons/XIcon';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ theme, toggleTheme }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      setShowModal(false);
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 sm:p-16 shadow-2xl animate-fade-in relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl shadow-lg mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <SparkleIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-6 tracking-tight">
              AI Resume Tailor
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              Bridge the gap between your experience and your dream job. Our AI analyzes job descriptions to instantly tailor your resume for maximum impact.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
              {[
                { title: 'AI Optimized', desc: 'Smarter keyword integration' },
                { title: 'Instant Parsing', desc: 'PDF, Docx support' },
                { title: 'Custom Control', desc: 'Fine-tune every detail' }
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-xl bg-stone-50 dark:bg-slate-700/50 border border-stone-100 dark:border-slate-700">
                  <h3 className="font-bold text-stone-800 dark:text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="group relative flex items-center justify-center w-full sm:w-auto gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Get Started Free
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            <p className="mt-12 text-sm text-stone-500 dark:text-slate-400">
              Trusted by job seekers worldwide.
            </p>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !isSubmitting && setShowModal(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in transform transition-all">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 transition-colors"
              disabled={isSubmitting}
            >
              <XIcon className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-stone-500 dark:text-slate-400">Sign in to start tailoring your resume</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="flex items-center justify-center w-full gap-3 px-6 py-3 border border-stone-200 dark:border-slate-700 rounded-xl hover:bg-stone-50 dark:hover:bg-slate-700 transition-all duration-200 font-semibold text-stone-700 dark:text-slate-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                Continue with Google
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-stone-400 dark:text-slate-500 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
