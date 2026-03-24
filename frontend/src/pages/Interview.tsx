import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { Mic, Phone, Clock } from "lucide-react";

const InterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const vapiRef = useRef<Vapi | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [vapiStatus, setVapiStatus] = useState("idle");
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [name, setName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  // Subtitles state
  const [agentTranscript, setAgentTranscript] = useState("");
  const [userTranscript, setUserTranscript] = useState("");

  // Start user camera feed
useEffect(() => {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Camera API not supported on this browser/device.");
    return;
  }
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })
    .then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    })
    .catch((err) => {
      alert("Camera error: " + err.name + " - " + err.message);
      console.error("Camera error:", err);
    });
}, []);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save answers to database
  const saveAnswers = async () => {
    const token = localStorage.getItem("token");
    if (!sessionId ) return;

    try {
      const response = await fetch(
        `https://voice-agent-tbys.onrender.com/api/interview/answer/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ answers }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        console.log("Error while sending answers");
      }
      console.log("Answers saved successfully");
      console.log(response);
      console.log(response)
    } catch (err) {
      console.error("Failed to save answers:", err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("token");
      if (!sessionId) {
        setLoadingError("Session ID is missing in the URL.");
        return;
      }
      try {
        const response = await fetch(
          `https://voice-agent-tbys.onrender.com/api/interview/get/${sessionId}`,
          { headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
           credentials: "include" }
        );
        const data = await response.json();
        if (!data?.data?.details) throw new Error("Missing session details");
        setSession(data.data);

        const qs =
          data.data.questions ||
          data.data.details.question?.questions ||
          data.data.details.question ||
          [];

        const username =
          data.data.fullName ||
          data.data.user.fullName?.fullName ||
          data.data.user.fullName;
        setName(username);

        setQuestions(Array.isArray(qs) ? qs : []);
      } catch (err: any) {
        setLoadingError(err.message);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Save answers when call ends
  useEffect(() => {
    if (vapiStatus === "ended" || vapiStatus === "error") {
      saveAnswers();
    }
  }, [vapiStatus]);

  useEffect(() => {
    if (!session || questions.length === 0) return;

    const PUBLIC_KEY =import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!PUBLIC_KEY) {
      setLoadingError("VAPI public API key is missing");
      return;
    }

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;
    setVapiStatus("initializing");

    vapi.on("call-start", () => {
      setIsCallActive(true);
      setVapiStatus("active");
    });

    vapi.on("call-end", () => {
      console.log("Call has ended ✅"); // ← add this
      setIsCallActive(false);
      setVapiStatus("ended");

      saveAnswers().then(() => {
        navigate(`/results/${sessionId}`);
      });
    });

    vapi.on("error", (err: any) => {
      console.error("Vapi error:", err);
      setLoadingError(err.message || JSON.stringify(err));
      setVapiStatus("error");
    });

    // Listen for transcripts and capture answers
    vapi.on("message", (msg: any) => {
      if (
        msg.type === "transcript" &&
        msg.transcriptType === "final" &&
        typeof msg.transcript === "string"
      ) {
        if (msg.role === "assistant") {
          setAgentTranscript(msg.transcript);

          // Detect new question from agent
          const currentQuestion = questions[currentQuestionIndex]?.question;
          if (currentQuestion && msg.transcript.includes(currentQuestion)) {
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            );
          }
        } else if (msg.role === "user") {
          setUserTranscript(msg.transcript);

          // Save user answer with timestamp
          if (currentQuestionIndex < questions.length) {
            const newAnswer = {
              questionIndex: currentQuestionIndex,
              answer: msg.transcript,
              timestamp: new Date(),
            };

            setAnswers((prev) => [...prev, newAnswer]);
          }
        }
      }
    });

    const jobPosition = session.details.jobposition || "the position";
    const questionList = questions
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");

    vapi.start({
      name: "AI Recruiter",
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
You are an AI voice assistant conducting interviews.
Begin with a friendly intro:
"Hey ${name}! Welcome to your ${jobPosition} interview."
Ask one question at a time from this list:
${questionList}
Offer hints if needed.
Encourage after answers.
Wrap up after all questions:
"Thanks for chatting! Hope to see you crushing projects soon!"
            `.trim(),
          },
        ],
      },
    });

    return () => {
      if (vapiRef.current) vapiRef.current.stop();
    };
  }, [session, questions, navigate, sessionId, name]);

  const handleEndCall = () => {
    setIsCallActive(false);
    vapiRef.current?.stop();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (loadingError) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Error Loading Session</h2>
        <p>{loadingError}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!session) {
    return <div className="p-8 text-center">Loading interview session…</div>;
  }

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
    {/* Header */}
    <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-xl font-semibold text-slate-800">
          PM Interviewer
        </span>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">
        AI Interview Session
      </h1>
      <div className="flex items-center space-x-2 text-slate-600">
        <Clock className="w-5 h-5" />
        <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
      </div>
    </div>
    {/* Main Content */}
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Video Call Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Recruiter */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
<div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
<div className="text-center">
<div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
<img
src="/Ai.gif"
alt="AI Recruiter"
className="w-20 h-20 rounded-full object-cover"
/>
</div>
<h3 className="text-lg font-semibold text-slate-800">
AI Recruiter
</h3>
</div>
<div className="absolute top-4 left-4">
<div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
<span>{isCallActive ? "Active" : "Idle"}</span>
</div>
</div>
{/* AGENT SUBTITLE */}
<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
{agentTranscript && (
<div className="inline-block bg-white/80 px-4 py-2 rounded text-slate-800 text-lg font-medium shadow">
{agentTranscript}
</div>
)}
</div>
</div>
</div>
{/* Candidate */}
<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
<div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
<div className="text-center w-full h-full flex flex-col items-center justify-center">
{/* Live camera video */}
<video
ref={videoRef}
autoPlay
playsInline
muted
className="w-40 h-40 object-cover rounded-full mx-auto mb-4 bg-black shadow-lg"
style={{ background: "#111", borderRadius: "50%" }}
/>
<h3 className="text-lg font-semibold text-slate-800">
{name}
</h3>
</div>
<div className="absolute top-4 left-4">
<div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
<span>Connected</span>
</div>
</div>
{/* USER SUBTITLE */}
<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
{userTranscript && (
<div className="inline-block bg-white/80 px-4 py-2 rounded text-slate-800 text-lg font-medium shadow">
{userTranscript}
</div>
)}
</div>
</div>
</div>
</div>
        {/* Controls */}
        <div className="flex justify-center space-x-6">
          <Button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-slate-600 hover:bg-slate-700"
            } transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            <Mic className="w-6 h-6 text-white" />
          </Button>
          <Button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Phone className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Status */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-lg">
            {isCallActive
              ? "Interview in Progress..."
              : vapiStatus === "ended"
                ? "Interview Ended"
                : vapiStatus === "error"
                  ? "Error in Interview"
                  : "Ready to start"}
          </p>
          <p className="text-sm mt-2">
            Current Question: {currentQuestionIndex + 1}/{questions.length}
          </p>
        </div>

        {/* Interview Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold">Job Details</h2>
            <p>
              <strong>Position:</strong> {session.details.jobposition}
            </p>
            <p>
              <strong>Type:</strong> {session.details.type}
            </p>
            <p>
              <strong>Duration:</strong> {session.details.timeduration} minutes
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-3 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Debug Info</h3>
          <p>Session ID: {sessionId}</p>
          <p>Questions loaded: {questions.length}</p>
          <p>Current Question Index: {currentQuestionIndex}</p>
          <p>Answers captured: {answers.length}</p>
          <p>VAPI Status: {vapiStatus}</p>
          <p>Call Active: {isCallActive ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  </div>
);

};

export default InterviewPage;
