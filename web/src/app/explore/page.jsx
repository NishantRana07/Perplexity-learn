"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Search,
  Filter,
  Zap,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";

export default function ExplorePage() {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [searchTerm, selectedCategory, selectedDifficulty, skills]);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
        setFilteredSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (skill) => skill.category === selectedCategory,
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (skill) => skill.difficulty_level === selectedDifficulty,
      );
    }

    setFilteredSkills(filtered);
  };

  const startLearning = async (skill) => {
    // Get user session
    let session = localStorage.getItem("autolearn_session");
    if (!session) {
      session = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("autolearn_session", session);
    }

    try {
      // Generate roadmap prompt
      const promptResponse = await fetch("/api/prompt-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skill.name,
          templateType: "roadmap",
          duration: skill.estimated_duration_days,
        }),
      });

      if (promptResponse.ok) {
        const promptData = await promptResponse.json();

        // Create learning path
        const learningPathResponse = await fetch("/api/learning-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillId: skill.id,
            userSession: session,
            title: `${skill.name} Learning Path`,
            description: skill.description,
            totalDays: skill.estimated_duration_days,
            cometQueryUrl: promptData.cometUrl,
            generatedPrompt: promptData.generatedPrompt,
          }),
        });

        if (learningPathResponse.ok) {
          // Open Comet
          window.open(promptData.cometUrl, "_blank");

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error starting learning path:", error);
    }
  };

  const categories = [...new Set(skills.map((skill) => skill.category))];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#8B70F6]/30 border-t-[#8B70F6] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Loading skills...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-[#121212] font-semibold text-xl">
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
                href="/assignment-helper"
                className="px-4 py-2 text-[#121212] opacity-80 hover:opacity-100 font-medium transition-opacity"
              >
                Assignment Helper
              </a>
            </div>
          </div>
        </header>

        <main className="px-6 py-12">
          <div className="max-w-[1200px] mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#121212] mb-4"
                style={{ fontFamily: "Instrument Serif, serif" }}
              >
                Explore Skills
              </h1>
              <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                Discover new skills to learn and start your AI-powered learning
                journey today.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl border border-[#E8E7E4] p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]"
                  />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none bg-white transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E7E4] focus:border-[#8B70F6] focus:outline-none bg-white transition-colors"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() +
                          difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory || selectedDifficulty) && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F0F0F0]">
                  <span className="text-sm text-[#666666]">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <span className="px-3 py-1 bg-[#8B70F6]/10 text-[#8B70F6] rounded-lg text-sm">
                      Search: {searchTerm}
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="px-3 py-1 bg-[#8B70F6]/10 text-[#8B70F6] rounded-lg text-sm">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedDifficulty && (
                    <span className="px-3 py-1 bg-[#8B70F6]/10 text-[#8B70F6] rounded-lg text-sm">
                      Level: {selectedDifficulty}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                      setSelectedDifficulty("");
                    }}
                    className="px-3 py-1 text-[#666666] hover:text-[#121212] text-sm transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-[#666666]">
                Showing {filteredSkills.length} of {skills.length} skills
              </p>
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#F0F0F0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-[#666666]" />
                </div>
                <h3 className="text-xl font-semibold text-[#121212] mb-2">
                  No skills found
                </h3>
                <p className="text-[#666666]">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-white rounded-2xl border border-[#E8E7E4] p-6 hover:shadow-lg hover:border-[#8B70F6] transition-all group"
                  >
                    {/* Skill Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#121212] text-lg mb-2 group-hover:text-[#8B70F6] transition-colors">
                          {skill.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm text-[#666666] bg-[#F5F4F0] px-2 py-1 rounded">
                            {skill.category}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getDifficultyColor(skill.difficulty_level)}`}
                          >
                            {skill.difficulty_level}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Zap size={16} className="text-white" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#666666] text-sm mb-4 line-clamp-3">
                      {skill.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-1 text-[#666666]">
                        <Clock size={14} />
                        <span className="text-sm">
                          {skill.estimated_duration_days} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[#666666]">
                        <TrendingUp size={14} />
                        <span className="text-sm">Popular</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => startLearning(skill)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#8B70F6] hover:bg-[#7E64F2] text-white rounded-xl font-medium transition-colors group-hover:bg-[#7E64F2]"
                    >
                      <span>Start Learning</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
