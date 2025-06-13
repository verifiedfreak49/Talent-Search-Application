import React from 'react';

export default function JobDescriptionDisplay({ description }: { description: string }) {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white whitespace-pre-line font-nunito animate-fade-in">
      <h2 className="text-3xl font-encode mb-6">Generated Job Description</h2>
      <p className="leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
}
