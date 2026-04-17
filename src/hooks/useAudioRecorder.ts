import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cleanText } from '@/lib/cleanText';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { addTranscriptLine } = useAppStore();
  
  // Guard to debounce overlapping chunks 
  const isUploadingRef = useRef(false);

  const processAudioChunk = async (blob: Blob) => {
    if (isUploadingRef.current) return;
    
    isUploadingRef.current = true;
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      // Ensuring format strictly parses as webm standard file 
      const audioFile = new File([blob], 'audio_chunk.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription API failed');
      }

      const data = await response.json();
      const cleanedText = cleanText(data.text);
      
      // Prevent duplicate or empty transcripts
      if (cleanedText && cleanedText.length > 0) {
        addTranscriptLine(cleanedText);
      }
    } catch (error) {
      console.error('Audio processing chunk failed:', error);
    } finally {
      setIsTranscribing(false);
      // Minimal debounce timeout to prevent double-firing edge cases
      setTimeout(() => {
        isUploadingRef.current = false;
      }, 500);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          // Convert blob properly as specifically requested
          const blob = new Blob([event.data], { type: 'audio/webm' });
          await processAudioChunk(blob);
        }
      };

      // 30 sec chunks
      mediaRecorder.start(30000); 
      setIsRecording(true);
      
    } catch (err) {
      console.error('Microphone permission or access error:', err);
      alert('Could not access microphone.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  };
}
