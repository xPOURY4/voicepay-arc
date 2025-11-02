/**
 * VoicePay Arc - useVoice Hook
 * Custom hook for voice processing with state management, error handling, and retry mechanisms
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PaymentIntent, VoiceProcessingState } from '@/lib/blockchain/types';

interface VoiceCommand {
  id: string;
  transcript: string;
  intent: PaymentIntent;
  timestamp: Date;
  success: boolean;
}

interface UseVoiceOptions {
  maxRecordingDuration?: number;
  minRecordingDuration?: number;
  autoRetry?: boolean;
  maxRetries?: number;
  onSuccess?: (transcript: string, intent: PaymentIntent) => void;
  onError?: (error: string) => void;
}

interface UseVoiceReturn {
  // State
  state: VoiceProcessingState;
  transcript: string | null;
  intent: PaymentIntent | null;
  error: string | null;
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  audioLevel: number;
  commandHistory: VoiceCommand[];

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  retry: () => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;

  // Utils
  canRecord: boolean;
  hasPermission: boolean | null;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    maxRecordingDuration = parseInt(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION || '10000'),
    minRecordingDuration = parseInt(process.env.NEXT_PUBLIC_MIN_RECORDING_DURATION || '1000'),
    autoRetry = false,
    maxRetries = 3,
    onSuccess,
    onError,
  } = options;

  // State
  const [state, setState] = useState<VoiceProcessingState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const lastAudioBlobRef = useRef<Blob | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  /**
   * Cleanup all audio resources
   */
  const cleanupResources = useCallback(() => {
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

    mediaRecorderRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];
    setAudioLevel(0);
  }, []);

  /**
   * Analyze audio levels for visualization
   */
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1);

    setAudioLevel(normalizedLevel);
    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  }, []);

  /**
   * Process audio blob through API
   */
  const processAudioBlob = useCallback(
    async (audioBlob: Blob) => {
      setState('processing');
      setError(null);

      try {
        // Step 1: Transcribe audio
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const transcriptResponse = await fetch('/api/voice', {
          method: 'POST',
          body: formData,
        });

        if (!transcriptResponse.ok) {
          const errorData = await transcriptResponse.json();
          throw new Error(errorData.error || 'Transcription failed');
        }

        const transcriptData = await transcriptResponse.json();

        if (!transcriptData.success || !transcriptData.transcript) {
          throw new Error('No speech detected in audio');
        }

        const transcribedText = transcriptData.transcript;
        setTranscript(transcribedText);

        // Step 2: Extract intent
        const nlpResponse = await fetch('/api/nlp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: transcribedText }),
        });

        if (!nlpResponse.ok) {
          const errorData = await nlpResponse.json();
          throw new Error(errorData.error || 'Intent extraction failed');
        }

        const nlpData = await nlpResponse.json();

        if (!nlpData.success || !nlpData.intent) {
          throw new Error('Failed to extract payment intent');
        }

        const extractedIntent = nlpData.intent;

        if (!extractedIntent.isValid) {
          throw new Error(
            extractedIntent.validationErrors?.join(', ') || 'Invalid command'
          );
        }

        setIntent(extractedIntent);
        setState('complete');

        // Add to history
        const newCommand: VoiceCommand = {
          id: Date.now().toString(),
          transcript: transcribedText,
          intent: extractedIntent,
          timestamp: new Date(),
          success: true,
        };

        setCommandHistory((prev) => [newCommand, ...prev].slice(0, 10));

        // Reset retry count
        retryCountRef.current = 0;

        // Call success callback
        if (onSuccess) {
          onSuccess(transcribedText, extractedIntent);
        }

        // Reset to idle after delay
        setTimeout(() => {
          setState('idle');
        }, 2000);
      } catch (err: any) {
        console.error('Voice processing error:', err);
        const errorMessage = err.message || 'Failed to process voice command';
        setError(errorMessage);
        setState('error');

        // Add failed command to history
        if (transcript) {
          const failedCommand: VoiceCommand = {
            id: Date.now().toString(),
            transcript: transcript,
            intent: null as any,
            timestamp: new Date(),
            success: false,
          };
          setCommandHistory((prev) => [failedCommand, ...prev].slice(0, 10));
        }

        // Call error callback
        if (onError) {
          onError(errorMessage);
        }

        // Auto retry if enabled
        if (autoRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            if (lastAudioBlobRef.current) {
              processAudioBlob(lastAudioBlobRef.current);
            }
          }, 1000);
        } else {
          // Reset to idle after delay
          setTimeout(() => {
            setState('idle');
          }, 3000);
        }
      }
    },
    [autoRetry, maxRetries, onSuccess, onError, transcript]
  );

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    if (state !== 'idle' && state !== 'error') {
      return;
    }

    setState('requesting');
    setError(null);
    setTranscript(null);
    setIntent(null);
    setRecordingTime(0);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Setup audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);

      // Start audio level analysis
      analyzeAudioLevel();

      // Setup media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        lastAudioBlobRef.current = audioBlob;

        // Check minimum duration
        if (recordingTime * 1000 < minRecordingDuration) {
          setError('Recording is too short. Please speak longer.');
          setState('error');
          cleanupResources();
          setTimeout(() => setState('idle'), 3000);
          return;
        }

        processAudioBlob(audioBlob);
        cleanupResources();
      };

      // Start recording
      mediaRecorder.start();
      setState('listening');

      // Start recording timer
      let time = 0;
      recordingTimerRef.current = setInterval(() => {
        time++;
        setRecordingTime(time);
      }, 1000);

      // Auto-stop after max duration
      setTimeout(() => {
        if (
          mediaRecorder.state === 'recording' &&
          mediaRecorderRef.current === mediaRecorder
        ) {
          stopRecording();
        }
      }, maxRecordingDuration);
    } catch (err: any) {
      console.error('Failed to start recording:', err);

      let errorMessage = 'Failed to start recording';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access.';
        setHasPermission(false);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application.';
      }

      setError(errorMessage);
      setState('error');

      if (onError) {
        onError(errorMessage);
      }

      cleanupResources();

      setTimeout(() => {
        setState('idle');
      }, 3000);
    }
  }, [
    state,
    minRecordingDuration,
    maxRecordingDuration,
    analyzeAudioLevel,
    cleanupResources,
    processAudioBlob,
    onError,
    recordingTime,
  ]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
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
  }, []);

  /**
   * Cancel recording
   */
  const cancelRecording = useCallback(() => {
    setState('idle');
    setError(null);
    setTranscript(null);
    setIntent(null);
    setRecordingTime(0);
    cleanupResources();
  }, [cleanupResources]);

  /**
   * Retry last command
   */
  const retry = useCallback(async () => {
    if (lastAudioBlobRef.current) {
      retryCountRef.current = 0;
      await processAudioBlob(lastAudioBlobRef.current);
    } else {
      await startRecording();
    }
  }, [processAudioBlob, startRecording]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error') {
      setState('idle');
    }
  }, [state]);

  /**
   * Clear command history
   */
  const clearHistory = useCallback(() => {
    setCommandHistory([]);
  }, []);

  // Computed values
  const isRecording = state === 'listening';
  const isProcessing = state === 'processing';
  const canRecord = state === 'idle' || state === 'error';

  return {
    // State
    state,
    transcript,
    intent,
    error,
    isRecording,
    isProcessing,
    recordingTime,
    audioLevel,
    commandHistory,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    retry,
    clearError,
    clearHistory,

    // Utils
    canRecord,
    hasPermission,
  };
}

export default useVoice;
