import { useState, useRef, useEffect } from 'react';
import { FileText, Mic, Video, CheckCircle, Loader, AlertCircle, Download } from 'lucide-react';

interface CaptionSegment {
  start: number;
  end: number;
  text: string;
  words: Array<{ word: string; start: number; end: number }>;
}

interface Question {
  id: number;
  question_statement: string;
  options?: string;
  answer: string;
  solution?: string;
}

interface InstagramReelCreatorProps {
  question: Question;
  examName: string;
}

export default function InstagramReelCreator({ question, examName }: InstagramReelCreatorProps) {
  const [script, setScript] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const GEMINI_API_KEY = 'AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw';
  const VOICE_API_KEY = 'sk_e7983a84b66dc07658f0286b863641fe7e87d7a93aca7c15';
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

  const generateScript = async () => {
    setLoading('script');
    setError(null);

    try {
      const prompt = `Create an engaging educational video script for Instagram Reels. Follow this exact structure:

1. Start with: "Hello everyone, today we are going to solve a question for ${examName} entrance exam."
2. Say: "So the question says:" then read the question statement word by word
3. For MCQ/MSQ questions, read each option clearly: "Option A: [text], Option B: [text]" etc.
4. After reading the question and options, say: "Try solving this question on your own. I'll give you 5 seconds." [PAUSE: 5 seconds]
5. Then reveal: "The answer is: ${question.answer}"
6. Finally explain the solution: ${question.solution || 'Provide a clear explanation'}
7. End with: "If you are looking for a complete guide for ${examName} or more practice questions and guidance, follow and comment ${examName} and it will be in your DMs."

Question: ${question.question_statement}
${question.options ? `Options: ${question.options}` : ''}
Answer: ${question.answer}
${question.solution ? `Solution: ${question.solution}` : ''}

Make the script conversational, engaging, and suitable for voice-over. Use simple language that sounds natural when spoken.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate script');

      const data = await response.json();
      const generatedScript = data.candidates[0]?.content?.parts[0]?.text;

      if (!generatedScript) throw new Error('No script generated');

      setScript(generatedScript);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const generateAudio = async () => {
    if (!script) return;

    setLoading('audio');
    setError(null);

    try {
      const cleanScript = script
        .replace(/\[PAUSE:.*?\]/g, '')
        .replace(/\[COUNTDOWN:.*?\]/g, '')
        .replace(/\*\*/g, '')
        .trim();

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': VOICE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanScript,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Voice generation failed: ${errorData.detail?.message || errorData.message || 'API error'}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Generated audio is empty');

      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setCurrentStep(3);

      await generateCaptionsFromScript(cleanScript);
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setLoading(null);
    }
  };

  const generateCaptionsFromScript = async (scriptText: string) => {
    const words = scriptText.split(/\s+/).filter(word => word.length > 0);
    const wordsPerSecond = 2.5;
    const secondsPerWord = 1 / wordsPerSecond;

    const generatedCaptions: CaptionSegment[] = [];
    let currentTime = 0;
    let currentPhrase: string[] = [];
    let phraseStartTime = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentPhrase.push(word);

      if (currentPhrase.length >= 5 || word.match(/[.!?]$/) || i === words.length - 1) {
        const text = currentPhrase.join(' ');
        const duration = currentPhrase.length * secondsPerWord;

        generatedCaptions.push({
          text: text,
          start: parseFloat(phraseStartTime.toFixed(2)),
          end: parseFloat((phraseStartTime + duration).toFixed(2)),
          words: currentPhrase.map((w, idx) => ({
            word: w,
            start: parseFloat((phraseStartTime + (idx * secondsPerWord)).toFixed(2)),
            end: parseFloat((phraseStartTime + ((idx + 1) * secondsPerWord)).toFixed(2))
          }))
        });

        currentTime = phraseStartTime + duration;
        phraseStartTime = currentTime;
        currentPhrase = [];
      }
    }

    setCaptions(generatedCaptions);
    setCurrentStep(4);
  };

  const createVideoWithCaptions = async () => {
    if (!audioUrl || captions.length === 0) return;

    setLoading('video');
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = 1080;
      canvas.height = 1920;

      const audio = new Audio(audioUrl);
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });

      const duration = audio.duration;
      const fps = 30;
      const totalFrames = Math.ceil(duration * fps);

      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.start();

      const templates = [
        { bg: '#1a1a2e', accent: '#16213e', text: '#eaeaea', highlight: '#0f3460' },
        { bg: '#0f0e17', accent: '#ff8906', text: '#fffffe', highlight: '#f25f4c' },
        { bg: '#16161a', accent: '#7f5af0', text: '#fffffe', highlight: '#2cb67d' },
        { bg: '#232946', accent: '#b8c1ec', text: '#fffffe', highlight: '#eebbc3' },
        { bg: '#004643', accent: '#abd1c6', text: '#fffffe', highlight: '#f9bc60' }
      ];

      const template = templates[Math.floor(Math.random() * templates.length)];

      for (let frame = 0; frame < totalFrames; frame++) {
        const currentTime = frame / fps;

        ctx.fillStyle = template.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = template.accent;
        ctx.fillRect(0, 0, canvas.width, 200);
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

        ctx.fillStyle = template.text;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(examName, canvas.width / 2, 120);

        const currentCaption = captions.find(
          cap => currentTime >= cap.start && currentTime <= cap.end
        );

        if (currentCaption) {
          const words = currentCaption.text.split(' ');
          const wordsPerLine = 4;
          const lines: string[] = [];

          for (let i = 0; i < words.length; i += wordsPerLine) {
            lines.push(words.slice(i, i + wordsPerLine).join(' '));
          }

          ctx.font = 'bold 64px Arial';
          const lineHeight = 90;
          const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

          lines.forEach((line, lineIndex) => {
            const y = startY + lineIndex * lineHeight;

            ctx.fillStyle = template.accent;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;

            const padding = 40;
            const metrics = ctx.measureText(line);
            const textWidth = metrics.width;
            const boxX = (canvas.width - textWidth) / 2 - padding;
            const boxY = y - 50;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 80;

            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.fillStyle = template.text;
            ctx.fillText(line, canvas.width / 2, y);
          });

          const currentWord = currentCaption.words.find(
            w => currentTime >= w.start && currentTime <= w.end
          );

          if (currentWord) {
            ctx.fillStyle = template.highlight;
            ctx.font = 'bold 72px Arial';
            const wordY = canvas.height / 2 + 150;
            ctx.fillText(currentWord.word, canvas.width / 2, wordY);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
      }

      mediaRecorder.stop();

      await new Promise((resolve) => {
        mediaRecorder.onstop = resolve;
      });

      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);

      setVideoBlob(videoBlob);
      setVideoUrl(videoUrl);
      setCurrentStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to create video');
    } finally {
      setLoading(null);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `instagram_reel_${question.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-6">Instagram Reel Creator</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={generateScript}
          disabled={loading !== null || currentStep > 1}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
            currentStep > 1
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">1. Generate Script</div>
              <div className="text-sm opacity-80">AI-powered script generation</div>
            </div>
          </div>
          {loading === 'script' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 1 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {script && (
          <div className="ml-8 p-4 bg-slate-700 rounded-lg max-h-60 overflow-y-auto">
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{script}</p>
          </div>
        )}

        <button
          onClick={generateAudio}
          disabled={!script || loading !== null || currentStep > 2}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
            currentStep > 2
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">2. Generate Audio & Captions</div>
              <div className="text-sm opacity-80">TTS voice-over + timing</div>
            </div>
          </div>
          {loading === 'audio' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 2 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {audioUrl && (
          <div className="ml-8 p-4 bg-slate-700 rounded-lg space-y-3">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
            {captions.length > 0 && (
              <p className="text-green-400 text-sm">Generated {captions.length} caption segments</p>
            )}
          </div>
        )}

        <button
          onClick={createVideoWithCaptions}
          disabled={!audioUrl || captions.length === 0 || loading !== null || currentStep > 4}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
            currentStep > 4
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">3. Create Instagram Reel</div>
              <div className="text-sm opacity-80">1080x1920 with caption highlighting</div>
            </div>
          </div>
          {loading === 'video' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 4 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {videoUrl && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg space-y-4">
            <h4 className="text-green-400 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Instagram Reel Ready!
            </h4>
            <video ref={videoRef} controls className="w-full rounded-lg max-h-96">
              <source src={videoUrl} type="video/webm" />
            </video>
            <button
              onClick={downloadVideo}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Instagram Reel
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
