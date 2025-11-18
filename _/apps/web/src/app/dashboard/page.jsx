"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  ExternalLink,
  CheckCircle,
  Circle,
  Calendar,
  Target,
  Plus,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserSession = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("autolearn_session");
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      fetchMilestones(selectedPath.id);
    }
  }, [selectedPath]);

  const fetchLearningPaths = async () => {
    try {
      const userSession = getUserSession();
      if (!userSession) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/learning-paths?userSession=${userSession}`,
      );
      if (response.ok) {
        const data = await response.json();
        setLearningPaths(data.learningPaths || []);
        if (data.learningPaths.length > 0) {
          setSelectedPath(data.learningPaths[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching learning paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (pathId) => {
    try {
      const response = await fetch(
        `/api/milestones/0?learningPathId=${pathId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setMilestones(data.milestones || []);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    }
  };

  const toggleMilestone = async (milestoneId, isCompleted) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (response.ok) {
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  is_completed: !isCompleted,
                  completed_at: !isCompleted ? new Date().toISOString() : null,
                }
              : m,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  };

  const getProgressPercentage = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.is_completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getCurrentWeek = () => {
    const completedDays = milestones.filter((m) => m.is_completed).length;
    return Math.ceil((completedDays + 1) / 7);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B70F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;500&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-[#F5F4F0] dark:bg-[#1A1A1A]">
        {/* Header */}
        <header className="bg-[#FAF9F7] dark:bg-[#1E1E1E] border-b border-[#E8E7E4] dark:border-[#404040] px-6 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <span className="text-[#121212] dark:text-white font-semibold text-xl">
                AutoLearn AI
              </span>
            </a>

            <a
              href="/"
              className="px-4 py-2 text-[#121212] dark:text-white opacity-80 hover:opacity-100 font-medium transition-opacity"
            >
              Create New Path
            </a>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="max-w-[1400px] mx-auto">
            {learningPaths.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#8B70F6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-[#121212] dark:text-white mb-4">
                  No Learning Paths Yet
                </h2>
                <p className="text-[#666666] dark:text-[#999999] mb-8">
                  Create your first AI-powered learning roadmap to get started
                </p>
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] text-white rounded-xl font-semibold hover:from-[#7E64F2] hover:to-[#8B70F6] transition-all"
                >
                  <Plus size={16} />
                  <span>Create Learning Path</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Learning Paths */}
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-[#121212] dark:text-white mb-6">
                    Your Learning Paths
                  </h2>
                  <div className="space-y-3">
                    {learningPaths.map((path) => (
                      <button
                        key={path.id}
                        onClick={() => setSelectedPath(path)}
                        className={`w-full p-4 rounded-xl text-left transition-colors ${
                          selectedPath?.id === path.id
                            ? "bg-[#8B70F6] text-white"
                            : "bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] hover:border-[#8B70F6] dark:hover:border-[#9D7DFF]"
                        }`}
                      >
                        <h3 className="font-medium truncate">
                          {path.skill_name}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${selectedPath?.id === path.id ? "text-white/80" : "text-[#666666] dark:text-[#999999]"}`}
                        >
                          {path.category} • {path.difficulty_level}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  {selectedPath && (
                    <>
                      {/* Path Header */}
                      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-2xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h1 className="text-2xl font-semibold text-[#121212] dark:text-white mb-2">
                              {selectedPath.skill_name}
                            </h1>
                            <p className="text-[#666666] dark:text-[#999999]">
                              {selectedPath.description}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#8B70F6]">
                                {getProgressPercentage()}%
                              </div>
                              <div className="text-sm text-[#666666] dark:text-[#999999]">
                                Complete
                              </div>
                            </div>
                            {selectedPath.comet_query_url && (
                              <button
                                onClick={() =>
                                  window.open(
                                    selectedPath.comet_query_url,
                                    "_blank",
                                  )
                                }
                                className="flex items-center space-x-2 px-4 py-2 bg-[#8B70F6] hover:bg-[#7E64F2] text-white rounded-xl font-medium transition-colors"
                              >
                                <ExternalLink size={16} />
                                <span>Open in Comet</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-[#F1F0EC] dark:bg-[#404040] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#8B70F6] to-[#9D7DFF] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage()}%` }}
                          />
                        </div>
                      </div>

                      {/* Progress Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#8B70F6] rounded-lg flex items-center justify-center">
                              <Calendar size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-[#121212] dark:text-white">
                                Week {getCurrentWeek()}
                              </div>
                              <div className="text-sm text-[#666666] dark:text-[#999999]">
                                Current Progress
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center">
                              <CheckCircle size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-[#121212] dark:text-white">
                                {
                                  milestones.filter((m) => m.is_completed)
                                    .length
                                }
                              </div>
                              <div className="text-sm text-[#666666] dark:text-[#999999]">
                                Days Completed
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                              <Target size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-[#121212] dark:text-white">
                                {selectedPath.total_days} Days
                              </div>
                              <div className="text-sm text-[#666666] dark:text-[#999999]">
                                Total Duration
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8E7E4] dark:border-[#404040] rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#121212] dark:text-white mb-6">
                          Daily Milestones
                        </h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-[#F8F7F5] dark:hover:bg-[#2A2A2A] transition-colors"
                            >
                              <button
                                onClick={() =>
                                  toggleMilestone(
                                    milestone.id,
                                    milestone.is_completed,
                                  )
                                }
                                className="flex-shrink-0"
                              >
                                {milestone.is_completed ? (
                                  <CheckCircle
                                    size={20}
                                    className="text-[#10B981]"
                                  />
                                ) : (
                                  <Circle
                                    size={20}
                                    className="text-[#D1D5DB] hover:text-[#8B70F6] transition-colors"
                                  />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-medium ${milestone.is_completed ? "line-through text-[#888888]" : "text-[#121212] dark:text-white"}`}
                                >
                                  {milestone.title}
                                </div>
                                {milestone.description && (
                                  <div className="text-sm text-[#666666] dark:text-[#999999] mt-1 truncate">
                                    {milestone.description}
                                  </div>
                                )}
                              </div>

                              <div className="text-xs text-[#888888] dark:text-[#777777]">
                                Day {milestone.day_number}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
