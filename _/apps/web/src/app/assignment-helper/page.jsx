"use client";

import { useState } from "react";
import {
  Brain,
  Sparkles,
  ExternalLink,
  FileText,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function AssignmentHelperPage() {
  const [skill, setSkill] = useState("");
  const [assignment, setAssignment] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAssignmentHelp = async () => {
    if (!skill.trim() || !assignment.trim()) return;

    setIsGenerating(true);

    try {
      // Generate assignment help prompt
      const response = await fetch("/api/prompt-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skill,
          templateType: "assignment",
          customPrompt: assignment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Open Comet with assignment help
        window.open(data.cometUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generating assignment help:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    {
      skill: "JavaScript",
      assignment: "Build a todo list app with local storage and filtering",
      category: "Web Development",
    },
    {
      skill: "Python",
      assignment: "Create a data analysis script for CSV files with pandas",
      category: "Data Science",
    },
    {
      skill: "Machine Learning",
      assignment: "Train a classification model to predict house prices",
      category: "AI/ML",
    },
    {
      skill: "React",
      assignment: "Build a weather app that fetches data from an API",
      category: "Frontend",
    },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7]">
        {/* Header */}
        <header className="bg-[#FAF9F7] border-b border-[#E8E7E4] px-6 py-4">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <span
                className="text-[#121212] font-semibold text-xl"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                AutoLearn AI
              </span>
            </a>

            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="px-4 py-2 text-[#121212] opacity-80 hover:opacity-100 font-medium transition-opacity"
              >
                Dashboard
              </a>
              <a
                href="/explore"
                className="px-4 py-2 text-[#121212] opacity-80 hover:opacity-100 font-medium transition-opacity"
              >
                Explore Skills
              </a>
            </div>
          </div>
        </header>

        <main className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={28} className="text-white" />
              </div>

              <h1
                className="text-4xl md:text-5xl font-semibold text-[#121212] mb-4"
                style={{ fontFamily: "Instrument Serif, serif" }}
              >
                Assignment Helper
              </h1>

              <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                Stuck on an assignment? Get AI-powered step-by-step guidance,
                code examples, and learning resources from Comet.
              </p>
            </div>

            {/* Assignment Input Form */}
            <div className="bg-white rounded-2xl border border-[#E8E7E4] p-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Skill Input */}
                <div>
                  <label className="block text-sm font-medium text-[#121212] mb-2">
                    Subject/Skill
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, Python, React, Data Science"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  />
                </div>

                {/* Assignment Type Quick Select */}
                <div>
                  <label className="block text-sm font-medium text-[#121212] mb-2">
                    Assignment Type
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none transition-colors bg-white"
                    onChange={(e) => {
                      if (e.target.value === "project") {
                        setAssignment("Build a complete project with");
                      } else if (e.target.value === "algorithm") {
                        setAssignment("Implement an algorithm for");
                      } else if (e.target.value === "debugging") {
                        setAssignment("Debug and fix this code:");
                      }
                    }}
                  >
                    <option value="">Select type (optional)</option>
                    <option value="project">Build Project</option>
                    <option value="algorithm">Algorithm/Logic</option>
                    <option value="debugging">Debug Code</option>
                    <option value="concept">Explain Concept</option>
                  </select>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#121212] mb-2">
                  Assignment Details
                </label>
                <textarea
                  placeholder="Describe your assignment in detail. Include requirements, what you're stuck on, any specific constraints, or error messages you're seeing..."
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none resize-none transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                />
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={generateAssignmentHelp}
                  disabled={!skill.trim() || !assignment.trim() || isGenerating}
                  className="px-8 py-4 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Getting Help...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Get AI Help</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Example Assignments */}
            <div className="mb-12">
              <h3
                className="text-xl font-semibold text-[#121212] mb-6 text-center"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Example Assignments
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSkill(example.skill);
                      setAssignment(example.assignment);
                    }}
                    className="p-4 bg-white border border-[#E8E7E4] rounded-xl hover:border-[#8B70F6] hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-[#8B70F6]/10 rounded-lg flex items-center justify-center">
                        <FileText size={14} className="text-[#8B70F6]" />
                      </div>
                      <span className="text-sm text-[#666666] bg-[#F5F4F0] px-2 py-1 rounded">
                        {example.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-[#121212] mb-1">
                      {example.skill}
                    </h4>
                    <p className="text-sm text-[#666666] line-clamp-2">
                      {example.assignment}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#F8F7F5] rounded-2xl p-8">
              <h3
                className="text-xl font-semibold text-[#121212] mb-6 text-center"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                How Assignment Helper Works
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-[#121212] mb-2">
                    Describe Your Assignment
                  </h4>
                  <p className="text-sm text-[#666666]">
                    Tell us what you're working on and where you're stuck
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ExternalLink size={18} className="text-white" />
                  </div>
                  <h4 className="font-medium text-[#121212] mb-2">
                    AI Analyzes & Helps
                  </h4>
                  <p className="text-sm text-[#666666]">
                    Comet breaks down the problem and provides step-by-step
                    guidance
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <h4 className="font-medium text-[#121212] mb-2">
                    Learn & Complete
                  </h4>
                  <p className="text-sm text-[#666666]">
                    Get code examples, explanations, and resources to finish
                    your work
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 text-center">
              <p className="text-[#666666] text-sm">
                <strong>Pro tip:</strong> Be specific about your requirements,
                include error messages, and mention what you've already tried
                for the best help.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
