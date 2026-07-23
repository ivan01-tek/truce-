import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  HelpCircle,
  HeartCrack,
  Handshake,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
const QUESTIONS = [
  {
    key: "q1",
    icon: MessageCircle,
    prompt: "hi good evening, how are you doing?",
    placeholder: "tell me honestly...",
  },
  {
    key: "q2",
    icon: HelpCircle,
    prompt:
      "so i'm skipping the formalities and going straight to why we stopped talking all of a sudden after talking things out?",
    placeholder: "type your answer here...",
  },
  {
    key: "q3",
    icon: HeartCrack,
    prompt:
      "do you just genuinely see me as a villain or a bad person no matter what i do to make things better between us?",
    placeholder: "be real with me...",
  },
];

const TRUCE_MESSAGE =
  "well whatever it is I'm going to see and read it from my end and address it, i love my close friends and i actually don't like it when a close friend of mine doesn't want to talk to me at all, that's if you even consider me a friend at all (hehe) anyways, i'm hoping we can see past our differences and i hope I'm alive to witness the day you stop seeing me as a bad person, cause truth be told I'm not, we just don't see eye to eye 90% of the time, which isn't bad in its own way, what matters is what happens afterwards which is us settling and having peace in the air, then proceeds to fight again and make peace again, a vicious yet sweet cycle if i might say... no long talks, TRUCE 🤝";

const WEB3FORMS_ACCESS_KEY = "399124c0-056f-4439-a9c3-1bf5392dd940";

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------
const slideVariants = {
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// ---------------------------------------------------------------------------
// Floating ambient blobs (background atmosphere)
// ---------------------------------------------------------------------------
function AmbientBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-20 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #93C5FD, #3B82F6 60%, transparent 80%)",
        }}
        animate={{ y: [0, 24, 0], x: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #BFDBFE, #2563EB 55%, transparent 80%)",
        }}
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 60%, #DBEAFE, #60A5FA 60%, transparent 80%)",
        }}
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signature element: a morphing "mood blob" avatar that reacts to progress
// ---------------------------------------------------------------------------
const BLOB_RADII = [
  "62% 38% 55% 45% / 45% 55% 45% 55%",
  "45% 55% 40% 60% / 55% 45% 60% 40%",
  "55% 45% 62% 38% / 40% 60% 40% 60%",
  "40% 60% 45% 55% / 60% 40% 55% 45%",
];

function MoodBlob({ step }) {
  const icons = [MessageCircle, HelpCircle, HeartCrack, Handshake];
  const Icon = icons[Math.min(step, icons.length - 1)];
  return (
    <motion.div
      className="relative mx-auto flex h-20 w-20 items-center justify-center shadow-lg shadow-blue-200"
      animate={{
        borderRadius: BLOB_RADII,
        rotate: [0, 6, -6, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 55%, #BFDBFE 100%)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <Icon className="h-8 w-8 text-white" strokeWidth={2.2} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Progress steps indicator
// ---------------------------------------------------------------------------
function ProgressDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            animate={{
              width: active ? 26 : 8,
              backgroundColor: active || done ? "#2563EB" : "#DBEAFE",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------
export default function TruceFlow() {
  // step: 0,1,2 = questions ; 3 = final truce card ; 4 = thank you
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [draft, setDraft] = useState("");
  const [decision, setDecision] = useState(null);
  const [submitState, setSubmitState] = useState("idle"); // idle | loading | success | error

  const totalQuestions = QUESTIONS.length;

  const handleNext = useCallback(() => {
    if (!draft.trim()) return;
    const current = QUESTIONS[step];
    setAnswers((prev) => ({ ...prev, [current.key]: draft.trim() }));
    setDraft("");
    setStep((s) => s + 1);
  }, [draft, step]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleDecision = useCallback(
    async (choice) => {
      setDecision(choice);
      setSubmitState("loading");
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: "New Reconciliation Response 🤝",
            q1_response: answers.q1,
            q2_response: answers.q2,
            q3_response: answers.q3,
            truce_decision: choice,
          }),
        });
        const data = await res.json();
        setSubmitState(data?.success ? "success" : "error");
      } catch (err) {
        setSubmitState("error");
      }
      setStep(4);
    },
    [answers]
  );

  const currentQuestion = QUESTIONS[step];

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Bricolage Grotesque', 'Inter', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <AmbientBlobs />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress indicator — only during the question phase */}
        {step < totalQuestions && (
          <div className="mb-6">
            <ProgressDots step={step} total={totalQuestions} />
          </div>
        )}

        <div
          className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/90 px-7 py-9 shadow-2xl shadow-blue-100 backdrop-blur-sm sm:px-10 sm:py-11"
        >
          <AnimatePresence mode="wait">
            {/* ---------------- QUESTIONS ---------------- */}
            {step < totalQuestions && (
              <motion.div
                key={`question-${step}`}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <MoodBlob step={step} />

                <p className="font-body mt-5 text-xs font-semibold uppercase tracking-widest text-blue-500">
                  question {step + 1} of {totalQuestions}
                </p>

                <h1 className="font-display mt-3 text-xl font-semibold leading-snug text-slate-800 sm:text-2xl">
                  {currentQuestion.prompt}
                </h1>

                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentQuestion.placeholder}
                  rows={3}
                  className="font-body mt-6 w-full resize-none rounded-2xl border-2 border-blue-100 bg-blue-50/40 px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNext}
                  disabled={!draft.trim()}
                  className="font-display mt-6 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  }}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ---------------- FINAL TRUCE CARD ---------------- */}
            {step === totalQuestions && (
              <motion.div
                key="truce"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <MoodBlob step={3} />

                <p className="font-body mt-5 text-xs font-semibold uppercase tracking-widest text-blue-500">
                  from me, to you
                </p>

                <p className="font-display mt-4 whitespace-pre-line text-left text-[0.95rem] leading-relaxed text-slate-700 sm:text-base">
                  {TRUCE_MESSAGE}
                </p>

                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDecision("Yes")}
                    className="font-display flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200"
                    style={{
                      background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    }}
                  >
                    <Handshake className="h-4 w-4" />
                    YES 🤝
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDecision("No")}
                    className="font-display flex items-center justify-center gap-2 rounded-full border-2 border-blue-200 bg-white px-7 py-3 text-sm font-bold text-blue-600"
                  >
                    NO 😅
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ---------------- THANK YOU / RESULT ---------------- */}
            {step === 4 && (
              <motion.div
                key="result"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{
                    borderRadius: BLOB_RADII,
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-20 w-20 items-center justify-center shadow-lg shadow-blue-200"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563EB 0%, #60A5FA 55%, #BFDBFE 100%)",
                  }}
                >
                  {submitState === "loading" ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  ) : (
                    <Check className="h-8 w-8 text-white" strokeWidth={2.4} />
                  )}
                </motion.div>

                <h2 className="font-display mt-6 text-xl font-bold text-slate-800">
                  {submitState === "loading"
                    ? "sending this over..."
                    : decision === "Yes"
                    ? "truce sealed. 🤝"
                    : "okay, noted. no pressure."}
                </h2>

                <p className="font-body mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                  {submitState === "error"
                    ? "hmm, the message didn't send — but your answer's been heard here either way."
                    : decision === "Yes"
                    ? "thank you for hearing me out. let's keep choosing peace, even after the messy parts."
                    : "that's fair, take your time. this'll still be here whenever you're ready."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
