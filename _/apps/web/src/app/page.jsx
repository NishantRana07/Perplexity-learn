"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  ExternalLink,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skills, setSkills] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get user session ID (create if doesn't exist)
  const getUserSession = () => {
    if (typeof window === "undefined") return null;

    let session = localStorage.getItem("autolearn_session");
    if (!session) {
      session = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("autolearn_session", session);
    }
    return session;
  };

  // Load skills on mount
  useEffect(() => {
    fetchSkills();
  }, []);

  // Filter suggested skills based on input
  useEffect(() => {
    if (skillInput.length > 0) {
      const filtered = skills
        .filter(
          (skill) =>
            skill.name.toLowerCase().includes(skillInput.toLowerCase()) ||
            skill.category.toLowerCase().includes(skillInput.toLowerCase()),
        )
        .slice(0, 5);
      setSuggestedSkills(filtered);
    } else {
      setSuggestedSkills([]);
    }
  }, [skillInput, skills]);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSkillInput(skill.name);
    setSuggestedSkills([]);
  };

  const generateLearningPath = async (templateType = "roadmap") => {
    if (!skillInput.trim()) return;

    setIsGenerating(true);

    try {
      // Generate prompt and Comet URL
      const promptResponse = await fetch("/api/prompt-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skillInput,
          templateType: templateType,
          duration: selectedSkill?.estimated_duration_days || 30,
        }),
      });

      if (!promptResponse.ok) {
        throw new Error("Failed to generate prompt");
      }

      const promptData = await promptResponse.json();

      // Create learning path in database
      const userSession = getUserSession();
      const learningPathResponse = await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: selectedSkill?.id,
          userSession,
          title: `${skillInput} Learning Path`,
          description: `AI-generated learning roadmap for ${skillInput}`,
          totalDays: selectedSkill?.estimated_duration_days || 30,
          cometQueryUrl: promptData.cometUrl,
          generatedPrompt: promptData.generatedPrompt,
        }),
      });

      if (learningPathResponse.ok) {
        // Open Comet in new tab
        window.open(promptData.cometUrl, "_blank");

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error) {
      console.error("Error generating learning path:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const popularSkills = skills.slice(0, 6);

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F]">
        {/* Header */}
        <header className="bg-[#FAF9F7] dark:bg-[#1E1E1E] border-b border-[#E8E7E4] dark:border-[#404040] px-6 py-4">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <span
                className="text-[#121212] dark:text-white font-semibold text-xl"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                AutoLearn AI
              </span>
            </div>

            <a
              href="/dashboard"
              className="px-4 py-2 text-[#121212] dark:text-white opacity-80 hover:opacity-100 font-medium transition-opacity"
            >
              Dashboard
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 py-20 md:py-32">
          <div className="max-w-[1200px] mx-auto text-center">
            {/* Hero Headline */}
            <h1
              className="text-4xl md:text-[64px] leading-tight md:leading-[1.1] text-[#0D0D0D] dark:text-white mb-6 max-w-5xl mx-auto"
              style={{
                fontFamily: "Instrument Serif, serif",
                letterSpacing: "-0.02em",
              }}
            >
              Learn any skill with <em className="font-medium">AI-powered</em>
              <br />
              personalized roadmaps
            </h1>

            <p
              className="text-base md:text-lg text-[#555555] dark:text-[#C0C0C0] opacity-80 mb-12 max-w-[60ch] mx-auto"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Enter any skill and get an instant, structured learning path
              powered by Perplexity Comet. From beginner to expert in weeks, not
              months.
            </p>

            {/* Skill Input Section */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What would you like to learn? (e.g., React, Machine Learning, Digital Marketing)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-[#E8E7E4] dark:border-[#404040] bg-white dark:bg-[#1E1E1E] text-[#121212] dark:text-white placeholder-[#888888] dark:placeholder-[#999999] focus:border-[#8B70F6] dark:focus:border-[#9D7DFF] focus:outline-none focus:ring-0 transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  />

                  {skillInput && (
                    <button
                      onClick={() => generateLearningPath("roadmap")}
                      disabled={isGenerating}
                      className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Generate Path</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Skill Suggestions */}
                {suggestedSkills.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl shadow-lg z-50 overflow-hidden">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => handleSkillSelect(skill)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F8F7F5] dark:hover:bg-[#2A2A2A] border-b border-[#E8E7E4] dark:border-[#404040] last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[#121212] dark:text-white font-medium">
                              {skill.name}
                            </div>
                            <div className="text-sm text-[#666666] dark:text-[#999999]">
                              {skill.category} • {skill.difficulty_level}
                            </div>
                          </div>
                          <div className="text-xs text-[#888888] dark:text-[#777777]">
                            {skill.estimated_duration_days} days
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              {skillInput && (
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button
                    onClick={() => generateLearningPath("resources")}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl text-[#121212] dark:text-white hover:border-[#C5C5C5] dark:hover:border-[#606060] transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm font-medium"
                  >
                    <BookOpen size={14} />
                    <span>Find Resources</span>
                  </button>

                  <button
                    onClick={() => generateLearningPath("projects")}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl text-[#121212] dark:text-white hover:border-[#C5C5C5] dark:hover:border-[#606060] transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm font-medium"
                  >
                    <Target size={14} />
                    <span>Get Projects</span>
                  </button>
                </div>
              )}
            </div>

            {/* Popular Skills */}
            {popularSkills.length > 0 && (
              <div className="mb-16">
                <h3
                  className="text-lg font-semibold text-[#121212] dark:text-white mb-6"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Popular Skills to Learn
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillSelect(skill)}
                      className="p-4 bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl hover:border-[#8B70F6] dark:hover:border-[#9D7DFF] transition-colors group text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Zap size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#121212] dark:text-white truncate">
                            {skill.name}
                          </h4>
                          <p className="text-sm text-[#666666] dark:text-[#999999] capitalize">
                            {skill.difficulty_level} •{" "}
                            {skill.estimated_duration_days} days
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-2xl md:text-3xl font-semibold text-[#121212] dark:text-white mb-8"
                style={{ fontFamily: "Instrument Serif, serif" }}
              >
                How It Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-[#121212] dark:text-white mb-2">
                    Enter Your Skill
                  </h3>
                  <p className="text-[#666666] dark:text-[#999999] text-sm">
                    Type any skill you want to learn - from programming to
                    cooking
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ExternalLink size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-[#121212] dark:text-white mb-2">
                    AI Creates Roadmap
                  </h3>
                  <p className="text-[#666666] dark:text-[#999999] text-sm">
                    Perplexity Comet generates a personalized learning path with
                    resources
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#8B70F6] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-[#121212] dark:text-white mb-2">
                    Track Progress
                  </h3>
                  <p className="text-[#666666] dark:text-[#999999] text-sm">
                    Follow your daily goals and mark milestones as you learn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-t border-[#EDEDED] dark:border-[#404040] px-6 py-8">
          <div className="max-w-[1200px] mx-auto text-center">
            <p
              className="text-[#6B6B6B] dark:text-[#B0B0B0] text-sm"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Powered by Perplexity Comet • Built for learners everywhere
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
