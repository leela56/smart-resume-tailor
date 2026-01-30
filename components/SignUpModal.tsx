import React, { useState } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface SignUpModalProps {
  onClose: () => void;
  onSignUp: (name: string, role: string) => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUp }) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    onSignUp(fullName, role);
  };

  return (
    <div 
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-stone-200 rounded-lg p-8 w-full max-w-md m-4 relative shadow-2xl"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Welcome!</h2>
        <p className="text-stone-600 mb-6">Just a couple more details to get you started.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="full-name" className="block mb-2 font-semibold text-stone-700">Full Name</label>
            <input 
              type="text" 
              id="full-name" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              className="w-full p-3 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-stone-800"
              placeholder="e.g., Jane Doe"
              aria-label="Full Name"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block mb-2 font-semibold text-stone-700">Role you are applying for</label>
            <input 
              type="text" 
              id="role" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="w-full p-3 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-stone-800"
              placeholder="e.g., Senior Software Engineer"
              aria-label="Role you are applying for"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <button 
            type="submit" 
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-stone-200 disabled:text-stone-400 transition-colors duration-200 shadow-md"
          >
            <SparkleIcon className="w-5 h-5 mr-2" />
            Sign Up & Start Tailoring
          </button>
        </form>
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default SignUpModal;