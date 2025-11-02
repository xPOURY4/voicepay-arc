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
        return "Tap to Speak";
      case "requesting":
        return "Requesting Mic...";
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "complete":
        return "Success!";
      case "error":
        return "Try Again";
      default:
        return "Tap to Speak";
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
      <div className="relative flex items-center justify-center">
        {/* Waveform Visualization */}
        <AnimatePresence>
          {state === "listening" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary-500 rounded-full mx-1"
                  animate={{
                    height: [20, 60 * (audioLevel + 0.2), 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
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
            relative z-10 w-32 h-32 rounded-full font-semibold text-white
            shadow-2xl transition-all duration-300 min-touch
            ${state === "listening" ? "bg-red-500 hover:bg-red-600 animate-recording" : ""}
            ${state === "idle" ? "bg-primary-500 hover:bg-primary-600" : ""}
            ${state === "processing" ? "bg-yellow-500 cursor-wait" : ""}
            ${state === "complete" ? "bg-green-500" : ""}
            ${state === "error" ? "bg-red-500" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <div className="flex flex-col items-center justify-center">
            {/* Icon */}
            <span className="text-4xl mb-2">
              {state === "listening" ? "🔴" : "🎤"}
              {state === "processing" && "⏳"}
              {state === "complete" && "✅"}
              {state === "error" && "❌"}
            </span>

            {/* Text */}
            <span className="text-sm">{getButtonText()}</span>
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
            className="text-center mt-4"
          >
            <div className="text-2xl font-mono text-gray-700">
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
