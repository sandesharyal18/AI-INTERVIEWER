import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Settings, PlayCircle, MessageSquare, GitBranch, BarChart, Mic } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

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

const [statsRef, inView] = useInView({
  triggerOnce: true, // animate only once
  threshold: 0.3,    // 30% of section visible triggers the animation
});

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-5xl font-extrabold text-transparent bg-clip-text 
               bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 drop-shadow-lg mb-6">
  Practice Real Interviews & Improve with AI Feedback
</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
  Get personalized AI coaching, simulate real interviews, and boost your confidence in minutes.
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

  {/* Get Started Button */}
  <Link to="/register">
    <Button
      size="lg"
      className="w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-lg shadow-lg
                 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-700
                 transition-transform transition-colors duration-300"
    >
      Get Started
    </Button>
  </Link>

  {/* Sign In Button */}
  <Link to="/login">
    <Button
      variant="outline"
      size="lg"
      className="w-full sm:w-auto border-blue-600 text-blue-600 font-semibold rounded-lg
                 hover:bg-blue-600 hover:text-white hover:scale-105 hover:-translate-y-1 hover:shadow-md
                 transition-transform transition-colors duration-300"
    >
      Sign In
    </Button>
  </Link>

  {/* Google Login Button */}
  <Button
    onClick={() => googleLogin()}
    variant="outline"
    size="lg"
    className="w-full sm:w-auto flex items-center justify-center gap-2 border-gray-400 text-gray-700 font-semibold rounded-lg
               hover:bg-gray-100 hover:scale-105 hover:-translate-y-1 hover:shadow-md
               transition-transform transition-colors duration-300"
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
            className="bg-white p-6 rounded-xl shadow-xl text-center transform hover:rotate-2 hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-400"
          >
            <div className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${feature.bg}`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>


      
      {/* Stats Section */}
<div className="bg-white py-16" ref={statsRef}>
  <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    {[
  { number: 100, suffix: "+", label: "Students Practiced" },
  { number: 50, suffix: "+", label: "Interview Questions" },
  { number: 90, suffix: "%", label: "Success Rate" },
  { number: 24, suffix: "/7", label: "AI Support" },
].map((item, index) => (
  <div
    key={index}
    className={`transition-all duration-700 transform ${
    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
  >
    <h3 className="text-3xl font-bold text-blue-600">
      {inView ? <CountUp end={item.number} duration={2} /> : 0}{item.suffix}
    </h3>
    <p className="text-gray-600 mt-2">{item.label}</p>
  </div>
))}
  </div>
</div>
{/* How It Works */}
<div className="py-24 bg-gradient-to-b from-gray-50 to-white">
  <div className="max-w-6xl mx-auto px-4">
    
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">How It Works</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        A simple, guided process to simulate real interview scenarios and improve your responses
      </p>
    </div>

    

    <div className="relative">
      
      {/* vertical line */}
      <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gray-200 transform -translate-x-1/2"></div>

      <div className="space-y-12">
        {[
          {
            step: "1",
            title: "Sign Up / Login",
            desc: "Access the platform and manage your interview sessions.",
            icon: <User size={22} />,
          },
          {
            step: "2",
            title: "Select Interview Type",
            desc: "Choose the interview category based on your preparation needs.",
            icon: <Settings size={22} />,
          },
          {
            step: "3",
            title: "Start Session",
            desc: "Begin your mock interview with AI-generated questions.",
            icon: <PlayCircle size={22} />,
          },
          {
            step: "4",
            title: "Answer Questions",
            desc: "Respond in a natural, conversational format.",
            icon: <MessageSquare size={22} />,
          },
          {
            step: "5",
            title: "Adaptive Questions",
            desc: "Questions evolve based on your responses.",
            icon: <GitBranch size={22} />,
          },
          {
            step: "6",
            title: "Get Feedback",
            desc: "Receive insights to refine your answers.",
            icon: <BarChart size={22} />,
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            
            {/* content */}
            <div className="md:w-1/2 p-6">
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3 text-blue-600 font-semibold">
                  {item.icon}
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>

            {/* circle */}
            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold shadow-md z-10">
              {item.step}
            </div>

            {/* empty side */}
            <div className="md:w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

    </>
  );
};

export default Index;