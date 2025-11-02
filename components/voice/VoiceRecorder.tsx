/**
 * VoicePay Arc - Voice Recorder Component
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Handles audio recording, transcription, and intent processing
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  PaymentIntent,
  VoiceProcessingState,
} from "@/lib/blockchain/types";

// Lucide React Icons
const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WaveformIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 10v4" />
    <path d="M6 6v12" />
    <path d="M10 3v18" />
    <path d="M14 8v8" />
    <path d="M18 5v14" />
    <path d="M22 10v4" />
  </svg>
);

interface VoiceRecorderProps {
  onCommandProcessed: (transcript: string, intent: PaymentIntent) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onCommandProcessed,
  onError,
  disabled = false,
}) => {
  const [state, setState] = useState<VoiceProcessingState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      cleanupAudioResources();
    };
  }, []);

  /**
   * Cleanup audio resources
   */
  const cleanupAudioResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;
  };

  /**
   * Analyze audio levels for visualization
   */
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average audio level
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1);

    setAudioLevel(normalizedLevel);

    // Continue analyzing
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    if (disabled) return;

    try {
      setState("requesting");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);

      // Start audio level analysis
      analyzeAudio();

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processAudio();
      };

      // Start recording
      mediaRecorder.start();
      setState("listening");
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Auto-stop after max duration
      const maxDuration = parseInt(
        process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION || "10000",
      );

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording();
        }
      }, maxDuration);
    } catch (error: any) {
      console.error("Failed to start recording:", error);

      if (error.name === "NotAllowedError") {
        onError("Microphone access denied. Please allow microphone access.");
      } else if (error.name === "NotFoundError") {
        onError("No microphone found. Please connect a microphone.");
      } else {
        onError("Failed to start recording. Please try again.");
      }

      setState("error");
      cleanupAudioResources();
    }
  };

  /**
   * Stop recording audio
   */
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setState("processing");
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioLevel(0);
  };

  /**
   * Process recorded audio
   */
  const processAudio = async () => {
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Check minimum duration
      const minDuration = parseInt(
        process.env.NEXT_PUBLIC_MIN_RECORDING_DURATION || "1000",
      );

      if (recordingTime * 1000 < minDuration) {
        throw new Error("Recording is too short. Please speak longer.");
      }

      // Send to transcription API
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcriptResponse = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const transcriptData = await transcriptResponse.json();
      const transcriptText = transcriptData.transcript;

      setTranscript(transcriptText);

      // Send to NLP API for intent extraction
      const nlpResponse = await fetch("/api/nlp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcriptText }),
      });

      if (!nlpResponse.ok) {
        const errorData = await nlpResponse.json();
        throw new Error(errorData.error || "Intent extraction failed");
      }

      const nlpData = await nlpResponse.json();
      const intent = nlpData.intent;

      // Validate intent
      if (!intent.isValid) {
        throw new Error(
          intent.validationErrors?.join(", ") || "Invalid command",
        );
      }

      setState("complete");
      onCommandProcessed(transcriptText, intent);

      // Reset after delay
      setTimeout(() => {
        setState("idle");
        setTranscript("");
        setRecordingTime(0);
      }, 2000);
    } catch (error: any) {
      console.error("Failed to process audio:", error);
      onError(error.message || "Failed to process voice command");
      setState("error");

      // Reset after delay
      setTimeout(() => {
        setState("idle");
        setTranscript("");
        setRecordingTime(0);
      }, 3000);
    } finally {
      cleanupAudioResources();
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = () => {
    stopRecording();
    cleanupAudioResources();
    setState("idle");
    setTranscript("");
    setRecordingTime(0);
  };

  /**
   * Get button text based on state
   */
  const getButtonText = () => {
    switch (state) {
      case "idle":
        return "TAP TO SPEAK";
      case "requesting":
        return "STARTING...";
      case "listening":
        return "TAP TO STOP";
      case "processing":
        return "PROCESSING...";
      case "complete":
        return "SUCCESS!";
      case "error":
        return "TRY AGAIN";
      default:
        return "TAP TO SPEAK";
    }
  };

  /**
   * Format recording time
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Recording Button */}
      <div className="relative flex items-center justify-center py-8">
        {/* Animated Ring for Listening State */}
        <AnimatePresence>
          {state === "listening" && (
            <>
              <motion.div
                className="absolute w-48 h-48 rounded-full border-4 border-red-400"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute w-48 h-48 rounded-full border-4 border-red-300"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5,
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Waveform Visualization */}
        <AnimatePresence>
          {state === "listening" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 flex items-end justify-center space-x-1"
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-gradient-to-t from-red-500 to-pink-500 rounded-full"
                  animate={{
                    height: [15, 40 * (audioLevel + 0.3), 15],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Button */}
        <motion.button
          onClick={state === "listening" ? stopRecording : startRecording}
          disabled={
            disabled || state === "processing" || state === "requesting"
          }
          className={`
            relative z-10 w-40 h-40 rounded-full font-semibold text-white
            shadow-2xl transition-all duration-300 overflow-hidden
            ${state === "listening" ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" : ""}
            ${state === "idle" ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" : ""}
            ${state === "processing" ? "bg-gradient-to-br from-amber-400 to-orange-500 cursor-wait" : ""}
            ${state === "complete" ? "bg-gradient-to-br from-green-500 to-emerald-600" : ""}
            ${state === "error" ? "bg-gradient-to-br from-red-500 to-pink-600" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          whileHover={{ scale: disabled ? 1 : 1.08 }}
          whileTap={{ scale: disabled ? 1 : 0.92 }}
          animate={{
            boxShadow:
              state === "listening"
                ? [
                    "0 0 0 0 rgba(239, 68, 68, 0.7)",
                    "0 0 0 20px rgba(239, 68, 68, 0)",
                  ]
                : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: state === "listening" ? Infinity : 0,
              ease: "easeOut",
            },
          }}
        >
          {/* Background Pulse Effect */}
          {state === "listening" && (
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{
                scale: [1, 1.5],
                opacity: [0.2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}

          <div className="relative flex flex-col items-center justify-center">
            {/* Icon */}
            <motion.div
              animate={{
                rotate: state === "processing" ? 360 : 0,
                scale: state === "listening" ? [1, 1.1, 1] : 1,
              }}
              transition={{
                rotate: {
                  duration: 2,
                  repeat: state === "processing" ? Infinity : 0,
                  ease: "linear",
                },
                scale: {
                  duration: 0.8,
                  repeat: state === "listening" ? Infinity : 0,
                },
              }}
            >
              {state === "listening" && <StopIcon />}
              {state === "idle" && <MicIcon />}
              {state === "processing" && <LoaderIcon />}
              {state === "complete" && <CheckIcon />}
              {state === "error" && <MicIcon />}
              {state === "requesting" && <LoaderIcon />}
            </motion.div>

            {/* Text */}
            <motion.span
              className="text-sm font-bold mt-3 tracking-wide"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {getButtonText()}
            </motion.span>
          </div>
        </motion.button>
      </div>

      {/* Recording Timer */}
      <AnimatePresence>
        {state === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-6"
          >
            <div className="text-3xl font-bold text-red-600 bg-red-50 px-6 py-3 rounded-full inline-block shadow-lg">
              {formatTime(recordingTime)}
            </div>
            <button
              onClick={cancelRecording}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {state === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-600 mb-2">
              Tap the microphone and say:
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>"Send 50 USDC to Alice"</p>
              <p>"What's my balance?"</p>
              <p>"Show transaction history"</p>
            </div>
            <motion.p
              className="text-sm font-semibold text-gray-600 mt-3"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔴 RECORDING
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (state === "complete" || state === "processing") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 bg-white rounded-lg shadow-md"
          >
            <p className="text-xs text-gray-500 mb-1">You said:</p>
            <p className="text-sm text-gray-800 font-medium">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      <AnimatePresence>
        {state === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-4"
          >
            <div className="inline-block">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Processing your command...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceRecorder;
