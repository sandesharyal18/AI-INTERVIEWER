import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

interface FeedbackData {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  skillBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultural: number;
  };
}

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const generateFeedback = async () => {
      setLoading(true);
      
      // Start the 3-second loading animation
      const loadingInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(loadingInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 60);

      // Wait for 3 seconds minimum
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        if (!sessionId) {
          setError("Invalid session ID.");
          setLoading(false);
          return;
        }

        // Updated URL to your production endpoint
        const res = await fetch(
          `https://voice-agent-tbys.onrender.com/api/interview/result/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
          } else {
            throw new Error(`Failed to fetch feedback: ${res.status}`);
          }
          return;
        }

        const data = await res.json();

        if (
          typeof data.overallScore !== "number" ||
          !data.skillBreakdown ||
          !Array.isArray(data.strengths) ||
          !Array.isArray(data.improvements) ||
          typeof data.detailedFeedback !== "string"
        ) {
          throw new Error("Invalid feedback data structure");
        }

        setFeedback(data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Could not fetch feedback. Please try again.");
      } finally {
        setLoading(false);
        clearInterval(loadingInterval);
      }
    };

    generateFeedback();
  }, [navigate, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6 p-8">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 animate-bounce">
              <img src="/Ai.gif" width={150} height={150} className="rounded-full"/>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Generating Your Feedback</h2>
          <p className="text-gray-600 max-w-md">
            Our AI is analyzing your interview performance and preparing detailed insights...
          </p>
          <div className="w-80 space-y-2">
            <Progress value={loadingProgress} className="h-2" />
            <p className="text-sm text-gray-500">{Math.round(loadingProgress)}% Complete</p>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center px-4">
        {error}
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b transition-all duration-300 hover:shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Interview Feedback</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-blue-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Overall Score</h2>
            <Progress value={feedback.overallScore} className="mb-2 h-3" />
            <p className="text-sm text-muted-foreground font-medium">{feedback.overallScore}%</p>
          </CardContent>
        </Card>

        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-green-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Skill Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(feedback.skillBreakdown).map(([skill, score]) => (
                <div key={skill} className="transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg">
                  <p className="capitalize text-sm font-medium text-gray-700">{skill}</p>
                  <Progress value={score} className="mb-1 h-2" />
                  <p className="text-xs text-muted-foreground">{score}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-emerald-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Strengths</h2>
            {feedback.strengths.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {feedback.strengths.map((point, index) => (
                  <li key={index} className="text-green-700 transition-all duration-200 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg">
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths provided.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-orange-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Areas for Improvement</h2>
            {feedback.improvements.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {feedback.improvements.map((point, index) => (
                  <li key={index} className="text-red-700 transition-all duration-200 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg">
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No improvement areas provided.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-purple-500">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Detailed Feedback</h2>
            <Separator className="my-2" />
            <div className="transition-all duration-200 hover:bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {feedback.detailedFeedback}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
