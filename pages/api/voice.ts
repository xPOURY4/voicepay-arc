/**
 * VoicePay Arc - Voice Processing API
 * Developer: TheRealPourya (https://github.com/xPOURY4)
 * Twitter: https://x.com/TheRealPourya
 * Date: November 2025
 *
 * This component is part of the VoicePay Arc project - a production-ready
 * voice payment system for Arc Testnet.
 *
 * Handles audio transcription using ElevenLabs API
 */

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import axios from "axios";
import { DemoVoiceService, isDemoMode } from "@/lib/demo/mockData";

// Disable body parser to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Voice processing API response
 */
interface VoiceResponse {
  success: boolean;
  transcript?: string;
  confidence?: number;
  duration?: number;
  error?: string;
  errorCode?: string;
}

/**
 * Transcribe audio using ElevenLabs REST API
 */
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  // ElevenLabs Speech-to-Text API endpoint
  const response = await axios.post(
    "https://api.elevenlabs.io/v1/speech-to-text",
    audioBuffer,
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "audio/mpeg",
      },
    },
  );

  return response.data.text || "";
}

/**
 * Parse multipart form data
 */
async function parseForm(
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

/**
 * POST /api/voice
 * Transcribe audio file to text
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoiceResponse>,
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      errorCode: "METHOD_NOT_ALLOWED",
    });
  }

  try {
    // Check if demo mode is enabled
    if (isDemoMode()) {
      const demoService = new DemoVoiceService();
      const result = await demoService.transcribe(new Blob());
      return res.status(200).json(result);
    }

    // Parse the form data
    const { files } = await parseForm(req);

    // Get the audio file
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
        errorCode: "MISSING_AUDIO_FILE",
      });
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);

    // Transcribe using ElevenLabs Speech-to-Text API
    const startTime = Date.now();
    const transcriptText = await transcribeAudio(audioBuffer);
    const processingTime = Date.now() - startTime;

    // Clean up temporary file
    try {
      fs.unlinkSync(audioFile.filepath);
    } catch (cleanupError) {
      console.warn("Failed to cleanup temporary file:", cleanupError);
    }

    // Validate transcript
    if (!transcriptText) {
      return res.status(400).json({
        success: false,
        error: "No speech detected in audio",
        errorCode: "NO_SPEECH_DETECTED",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      transcript: transcriptText,
      confidence: 0.95,
      duration: processingTime / 1000,
    });
  } catch (error: any) {
    console.error("Voice processing error:", error);

    // Handle specific error types
    if (error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        error: "Voice service configuration error",
        errorCode: "API_KEY_ERROR",
      });
    }

    if (error.message?.includes("rate limit")) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
        errorCode: "RATE_LIMIT_EXCEEDED",
      });
    }

    if (error.message?.includes("timeout")) {
      return res.status(408).json({
        success: false,
        error: "Request timeout. Please try again.",
        errorCode: "REQUEST_TIMEOUT",
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: "Failed to process voice command",
      errorCode: "VOICE_PROCESSING_FAILED",
    });
  }
}
