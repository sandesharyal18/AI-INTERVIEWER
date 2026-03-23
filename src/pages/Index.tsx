import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, User, Mic, } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";

const Index = () => {
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        if (codeResponse["code"]) {
          const result = await googleAuth(codeResponse["code"]);
          if (!result.data || !result.data.user) return;
          console.log("User data:", result.data.user);
        }
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
    onError: (error) => console.error("Google login failed:", error),
  });

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 drop-shadow-lg mb-6">
            AI-Powered Interview Preparation Platform
         </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Practice real interview questions, improve your skills, and receive instant feedback to perform your best in any interview.
          </p>

          <div className="flex justify-center mb-12">
            <img
              src="./login.png"
              alt="Login"
              className="w-full max-w-xl rounded-xl shadow-2xl transform hover:scale-105 transition duration-500"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform shadow-lg">
                Get Started
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform shadow">
                Sign In
              </Button>
            </Link>

            <Button
              onClick={() => googleLogin()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow"
            >
              <img src="./google.png" alt="Google logo" className="w-5 h-5" />
              Login with Google
            </Button>
          </div>

          {/* Why Choose Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our system simulates real interview scenarios, helping users gain confidence and improve performance through structured practice and feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <MessageSquare className="h-14 w-14 text-white" />,
            title: "AI-Generated Questions",
            desc: "Get personalized interview questions based on your job description using advanced AI",
            bg: "bg-blue-500",
          },
          {
            icon: <Mic className="h-14 w-14 text-white" />,
            title: "Voice Integration",
            desc: "Practice with voice-to-voice interaction for a realistic interview experience",
            bg: "bg-indigo-500",
          },
          
          {
            icon: <User className="h-14 w-14 text-white" />,
            title: "Detailed Feedback",
            desc: "Receive comprehensive feedback on your responses and areas for improvement",
            bg: "bg-teal-500",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-xl text-center hover:scale-105 transition-transform border border-transparent hover:border-blue-400"
          >
            <div className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${feature.bg}`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Index;