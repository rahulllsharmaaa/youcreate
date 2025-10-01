import { useState, useRef } from 'react';
import { FileText, Mic, Video, CheckCircle, Loader, AlertCircle, Download } from 'lucide-react';

interface Question {
  id: number;
  question_statement: string;
  options?: string;
  answer: string;
  solution?: string;
  question_type?: string;
}

interface InstagramReelCreatorProps {
  question: Question;
  examName: string;
  courseName: string;
}

const SCRIPT_VARIATIONS = [
  {
    intro: "Hello everyone, today we're solving a question for {exam} {course}.",
    questionIntro: "So the question is:",
    optionsIntro: "The options for this are:",
    pauseText: "Try solving this yourself. I'll give you 5 seconds. 5, 4, 3, 2, 1.",
    reveal: "Time's up! The answer and solution are on your screen.",
    outro: "Want the complete roadmap for {exam} {course}? Follow and comment 'roadmap' and it will be in your DMs."
  },
  {
    intro: "Hey everyone! Let's crack a {exam} {course} question together.",
    questionIntro: "Here's the question:",
    optionsIntro: "And here are your options:",
    pauseText: "Pause and try it yourself. You have 5 seconds. 5, 4, 3, 2, 1.",
    reveal: "Done! Check the answer and solution below.",
    outro: "For complete {exam} {course} preparation, follow and comment 'guide'."
  },
  {
    intro: "Welcome! Today's question is from {exam} {course}.",
    questionIntro: "The question states:",
    optionsIntro: "Options are:",
    pauseText: "Give it a shot! 5 seconds starting now. 5, 4, 3, 2, 1.",
    reveal: "Here's the answer with the solution.",
    outro: "Need more {exam} {course} questions? Follow and comment '{exam}' for resources."
  },
  {
    intro: "Hi there! Solving a {exam} {course} problem today.",
    questionIntro: "Question:",
    optionsIntro: "Your choices:",
    pauseText: "Try solving it. Countdown: 5, 4, 3, 2, 1.",
    reveal: "The correct answer and solution are displayed.",
    outro: "Follow for daily {exam} {course} content and comment 'help' for study materials."
  },
  {
    intro: "Hey! Let's solve this {exam} {course} question.",
    questionIntro: "Here's what the question asks:",
    optionsIntro: "The options:",
    pauseText: "Think about it! 5 seconds. 5, 4, 3, 2, 1.",
    reveal: "Answer revealed! Check the solution.",
    outro: "Want more practice? Follow and drop '{exam}' in comments."
  }
];

const VIDEO_TEMPLATES = [
  {
    name: 'Teal Gradient',
    bg1: '#1a5f7a',
    bg2: '#159895',
    bg3: '#57c5b6',
    headerBg: 'rgba(21, 152, 149, 0.3)',
    headerColor: '#00fff5',
    questionBg: 'rgba(255, 255, 255, 0.95)',
    questionColor: '#1a1a1a',
    optionBg: 'rgba(255, 255, 255, 0.9)',
    optionBorder: '#ffa500',
    accentColor: '#ffa500',
    timerBg: 'rgba(21, 152, 149, 0.9)',
    timerColor: '#ffffff'
  },
  {
    name: 'Light Modern',
    bg1: '#f5f5f5',
    bg2: '#e0e0e0',
    bg3: '#d0d0d0',
    headerBg: 'rgba(32, 139, 139, 0.9)',
    headerColor: '#ffffff',
    questionBg: 'rgba(255, 255, 255, 0.95)',
    questionColor: '#1a1a1a',
    optionBg: 'rgba(255, 255, 255, 0.95)',
    optionBorder: '#ff6b35',
    accentColor: '#ff6b35',
    timerBg: 'rgba(255, 107, 53, 0.9)',
    timerColor: '#ffffff'
  },
  {
    name: 'Dark Neon',
    bg1: '#0a1128',
    bg2: '#1a1a2e',
    bg3: '#16213e',
    headerBg: 'rgba(0, 255, 157, 0.2)',
    headerColor: '#00ff9d',
    questionBg: 'rgba(255, 255, 255, 0.95)',
    questionColor: '#1a1a1a',
    optionBg: 'rgba(34, 40, 49, 0.9)',
    optionBorder: '#00ff9d',
    accentColor: '#00ff9d',
    timerBg: 'rgba(0, 255, 157, 0.9)',
    timerColor: '#0a1128'
  },
  {
    name: 'Orange Sunset',
    bg1: '#f77062',
    bg2: '#fe5196',
    bg3: '#ffb997',
    headerBg: 'rgba(254, 81, 150, 0.3)',
    headerColor: '#ffffff',
    questionBg: 'rgba(255, 255, 255, 0.95)',
    questionColor: '#1a1a1a',
    optionBg: 'rgba(255, 255, 255, 0.9)',
    optionBorder: '#fe5196',
    accentColor: '#fe5196',
    timerBg: 'rgba(254, 81, 150, 0.9)',
    timerColor: '#ffffff'
  }
];

export default function InstagramReelCreator({ question, examName, courseName }: InstagramReelCreatorProps) {
  const [script, setScript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const VOICE_API_KEY = 'sk_e7983a84b66dc07658f0286b863641fe7e87d7a93aca7c15';
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

  const cleanMathematicalText = (text: string): string => {
    return text
      .replace(/\\/g, ' ')
      .replace(/\{|\}/g, ' ')
      .replace(/\[|\]/g, ' ')
      .replace(/\^/g, ' to the power ')
      .replace(/_/g, ' ')
      .replace(/matrix/gi, 'matrix with elements')
      .replace(/\bdet\b/gi, 'determinant')
      .replace(/\bint\b/gi, 'integral')
      .replace(/\d+x\d+/g, (match) => {
        const [rows, cols] = match.split('x');
        return `${rows} by ${cols}`;
      })
      .replace(/\s+/g, ' ')
      .trim();
  };

  const generateScript = async () => {
    setLoading('script');
    setError(null);

    try {
      const variation = SCRIPT_VARIATIONS[Math.floor(Math.random() * SCRIPT_VARIATIONS.length)];

      const questionText = cleanMathematicalText(question.question_statement);
      const hasOptions = question.options && (question.question_type === 'MCQ' || question.question_type === 'MSQ');

      let optionsText = '';
      if (hasOptions && question.options) {
        const optionsList = question.options.split(',').map(opt => opt.trim());
        optionsText = optionsList.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          return `Option ${letter}: ${cleanMathematicalText(opt)}`;
        }).join('. ');
      }

      const scriptParts = [
        variation.intro.replace('{exam}', examName).replace('{course}', courseName),
        variation.questionIntro,
        questionText,
        hasOptions ? variation.optionsIntro : '',
        hasOptions ? optionsText : '',
        variation.pauseText,
        variation.reveal,
        variation.outro.replace(/{exam}/g, examName).replace(/{course}/g, courseName)
      ].filter(Boolean);

      const generatedScript = scriptParts.join(' ');

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
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': VOICE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
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
      setAudioUrl(url);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setLoading(null);
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const createVideoWithCaptions = async () => {
    if (!audioUrl) return;

    setLoading('video');
    setError(null);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      const ctx = canvas.getContext('2d', { alpha: false });
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

      const template = VIDEO_TEMPLATES[selectedTemplate];

      const hasOptions = question.options && (question.question_type === 'MCQ' || question.question_type === 'MSQ');
      const optionsList = hasOptions ? question.options!.split(',').map(opt => opt.trim()) : [];

      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.start();

      const wordsPerSecond = 2.5;
      const scriptWords = script.split(/\s+/);
      const totalDuration = scriptWords.length / wordsPerSecond;

      const pauseStart = totalDuration * 0.6;
      const pauseDuration = 5;
      const revealStart = pauseStart + pauseDuration;

      for (let frame = 0; frame < totalFrames; frame++) {
        const currentTime = frame / fps;
        setProgress(Math.round((frame / totalFrames) * 100));

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, template.bg1);
        gradient.addColorStop(0.5, template.bg2);
        gradient.addColorStop(1, template.bg3);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        drawRoundedRect(ctx, 140, 60, 800, 120, 60);
        ctx.fillStyle = template.headerBg;
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = template.headerColor;
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${examName} ${courseName}`, canvas.width / 2, 120);

        if (currentTime < pauseStart) {
          ctx.save();
          drawRoundedRect(ctx, 80, 300, 920, 400, 30);
          ctx.fillStyle = template.questionBg;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = template.questionColor;
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          const questionLines = wrapText(ctx, question.question_statement, 840);
          questionLines.forEach((line, idx) => {
            ctx.fillText(line, canvas.width / 2, 400 + idx * 60);
          });

          if (hasOptions) {
            optionsList.forEach((option, idx) => {
              const y = 800 + idx * 180;
              const letter = String.fromCharCode(65 + idx);

              ctx.save();
              drawRoundedRect(ctx, 100, y, 880, 140, 30);
              ctx.fillStyle = template.optionBg;
              ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
              ctx.shadowBlur = 15;
              ctx.shadowOffsetY = 8;
              ctx.fill();
              ctx.strokeStyle = template.optionBorder;
              ctx.lineWidth = 4;
              ctx.stroke();
              ctx.restore();

              ctx.save();
              ctx.beginPath();
              ctx.arc(180, y + 70, 50, 0, Math.PI * 2);
              ctx.fillStyle = template.accentColor;
              ctx.fill();
              ctx.restore();

              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.font = 'bold 56px Arial';
              ctx.fillText(letter, 180, y + 82);

              ctx.fillStyle = template.questionColor;
              ctx.font = '44px Arial';
              ctx.textAlign = 'left';
              const optionLines = wrapText(ctx, option, 640);
              optionLines.forEach((line, lineIdx) => {
                ctx.fillText(line, 260, y + 60 + lineIdx * 50);
              });
            });
          }
        } else if (currentTime >= pauseStart && currentTime < revealStart) {
          const countdown = Math.ceil(revealStart - currentTime);

          ctx.save();
          drawRoundedRect(ctx, 340, 800, 400, 200, 40);
          ctx.fillStyle = template.timerBg;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 25;
          ctx.shadowOffsetY = 12;
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = template.timerColor;
          ctx.font = 'bold 120px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(countdown.toString(), canvas.width / 2, 900);

          ctx.font = 'bold 40px Arial';
          ctx.fillText('seconds', canvas.width / 2, 970);
        } else {
          ctx.save();
          drawRoundedRect(ctx, 80, 300, 920, 200, 30);
          ctx.fillStyle = template.questionBg;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = template.questionColor;
          ctx.font = 'bold 52px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Correct Answer: ' + question.answer, canvas.width / 2, 400);

          if (question.solution) {
            ctx.save();
            drawRoundedRect(ctx, 80, 550, 920, 800, 30);
            ctx.fillStyle = template.questionBg;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;
            ctx.fill();
            ctx.restore();

            ctx.fillStyle = template.accentColor;
            ctx.font = 'bold 48px Arial';
            ctx.fillText('Solution:', canvas.width / 2, 620);

            ctx.fillStyle = template.questionColor;
            ctx.font = '38px Arial';
            const solutionLines = wrapText(ctx, question.solution, 840);
            solutionLines.forEach((line, idx) => {
              ctx.fillText(line, canvas.width / 2, 700 + idx * 50);
            });
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
      }

      mediaRecorder.stop();

      await new Promise((resolve) => {
        mediaRecorder.onstop = resolve;
      });

      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const videoUrlResult = URL.createObjectURL(videoBlob);

      setVideoUrl(videoUrlResult);
      setCurrentStep(4);
      setProgress(100);
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
    a.download = `${examName}_${courseName}_${question.id}.webm`;
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

      <div className="mb-6">
        <label className="text-white text-sm font-medium mb-3 block">Select Template:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VIDEO_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTemplate(idx)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTemplate === idx
                  ? 'border-blue-500 ring-2 ring-blue-400'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              style={{
                background: `linear-gradient(135deg, ${template.bg1}, ${template.bg2}, ${template.bg3})`,
                minHeight: '100px'
              }}
            >
              <div className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded">
                {template.name}
              </div>
            </button>
          ))}
        </div>
      </div>

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
              <div className="text-sm opacity-80">Smart AI voice script</div>
            </div>
          </div>
          {loading === 'script' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 1 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {script && (
          <div className="ml-8 p-4 bg-slate-700 rounded-lg max-h-48 overflow-y-auto">
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
              <div className="font-medium">2. Generate Voice-Over</div>
              <div className="text-sm opacity-80">Professional TTS audio</div>
            </div>
          </div>
          {loading === 'audio' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 2 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {audioUrl && (
          <div className="ml-8 p-4 bg-slate-700 rounded-lg">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        <button
          onClick={createVideoWithCaptions}
          disabled={!audioUrl || loading !== null || currentStep > 3}
          className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
            currentStep > 3
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">3. Create Instagram Reel</div>
              <div className="text-sm opacity-80">1080x1920 professional video</div>
            </div>
          </div>
          {loading === 'video' ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : currentStep > 3 ? (
            <CheckCircle className="w-5 h-5" />
          ) : null}
        </button>

        {loading === 'video' && (
          <div className="ml-8">
            <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2 text-center">{progress}% completed</p>
          </div>
        )}

        {videoUrl && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg space-y-4">
            <h4 className="text-green-400 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Instagram Reel Ready!
            </h4>
            <video ref={videoRef} controls className="w-full rounded-lg" style={{ maxHeight: '500px' }}>
              <source src={videoUrl} type="video/webm" />
            </video>
            <button
              onClick={downloadVideo}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
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
