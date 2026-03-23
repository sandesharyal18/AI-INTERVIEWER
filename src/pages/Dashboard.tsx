import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Briefcase,
  Clock,
  Target,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [timeDuration, setTimeDuration] = useState("30");
  const [interviewType, setInterviewType] = useState("technical");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [name, setName] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openaiMessage, setopenaiMessage] = useState("");

useEffect(() => {
  const fetchUser = async () => {
    try {
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      
      const res = await fetch("https://voice-agent-tbys.onrender.com/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // Explicit token header
        },
        credentials: "include"  // Still include for cookies
      });

      
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setName(data.data.fullName);  // Updated to match ApiResponse structure
    } catch (error) {
      console.error("Error getting user details:", error);
    }
  };

  fetchUser();
}, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobPosition.trim() || !jobDescription.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter both job position and job description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
        const token = localStorage.getItem("token");
      // Send data to backend
      const response = await fetch(
        "https://voice-agent-tbys.onrender.com/api/question/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({
            jobposition: jobPosition,
            jobdescription: jobDescription,
            duration: timeDuration,
            type: interviewType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send details to backend");
      }

      const data = await response.json();
      // console.log(data.detailsId);
      const detailsId = data.detailsId;

      toast({
        title: "Questions generated!",
        description:
          "Your interview questions are ready. Let's start the interview.",
      });

      // Optionally, store data in localStorage
      localStorage.setItem(
        "questionListState",
        JSON.stringify({
          jobPosition,
          jobDescription,
          timeDuration,
          interviewType,
          detailsId,
          openaiMessage,
        })
      );

      navigate(`/question-list/${detailsId}`, {
        state: {
          jobPosition,
          jobDescription,
          timeDuration,
          interviewType,

          openaiMessage: data.message,
        },
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Interviewer
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {name}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Welcome back, {name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ready to ace your next interview? Let's create personalized
            questions tailored to your dream job.
          </p>
        </div>

        {/* Interview Setup Card */}
        <Card className="max-w-3xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Brain className="w-7 h-7" />
              Interview Setup
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Fill in the details below to generate AI-powered interview
              questions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="jobPosition"
                    className="text-lg font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Job Position
                  </Label>
                  <Input
                    id="jobPosition"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    className="h-12 text-lg border-2 border-blue-200 focus:border-purple-400 transition-colors duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="timeDuration"
                    className="text-lg font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Time Duration
                  </Label>
                  <select
                    id="timeDuration"
                    value={timeDuration}
                    onChange={(e) => setTimeDuration(e.target.value)}
                    required
                    className="h-12 w-full border-2 border-blue-200 rounded-md px-3 text-lg focus:border-purple-400 transition-colors duration-300"
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="interviewType"
                  className="text-lg font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Target className="w-5 h-5 text-purple-600" />
                  Interview Type
                </Label>
                <select
                  id="interviewType"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  required
                  className="h-12 w-full border-2 border-blue-200 rounded-md px-3 text-lg focus:border-purple-400 transition-colors duration-300"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="problem solving">Problem Solving</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="jobDescription"
                  className="text-lg font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here. Include requirements, responsibilities, and any specific skills mentioned..."
                  className="min-h-[150px] text-lg border-2 border-blue-200 focus:border-purple-400 transition-colors duration-300"
                  required
                />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 w-8 h-8 border-2 border-purple-300 rounded-full animate-pulse"></div>
                    </div>
                    <span className="ml-3 text-lg font-semibold text-gray-700">
                      Generating AI Questions...
                    </span>
                  </div>
                  <progress
                    value={loadingProgress}
                    className="w-full h-3 mb-3"
                  />

                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mr-2"></div>
                      Processing
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200 mr-2"></div>
                      Crafting Questions
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-400 mr-2"></div>
                      Finalizing
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Interview Questions
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-600">
              Advanced AI generates relevant questions based on your job
              description
            </p>
          </div>
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Personalized
            </h3>
            <p className="text-gray-600">
              Tailored questions specific to your role and industry
            </p>
          </div>
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Time-Efficient
            </h3>
            <p className="text-gray-600">
              Quick generation of comprehensive interview questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
