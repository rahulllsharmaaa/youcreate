import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CaptionRequest {
  video_id: string;
  audio_url: string;
  script: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { video_id, audio_url, script }: CaptionRequest = await req.json();

    // Parse script to identify different sections
    const sections = [];
    let currentTime = 0;

    // Split script by countdown marker if present
    const hasCountdown = script.includes('5... 4... 3... 2... 1');
    const scriptParts = script.split('5... 4... 3... 2... 1');

    if (scriptParts.length === 2) {
      // Pre-timer section
      const preTimerWords = scriptParts[0].trim().split(/\s+/).length;
      const preTimerDuration = preTimerWords / 2.5; // 2.5 words per second

      sections.push({
        type: 'question',
        text: scriptParts[0].trim(),
        start: currentTime.toFixed(2),
        end: (currentTime + preTimerDuration).toFixed(2)
      });

      currentTime += preTimerDuration;

      // Countdown section (5 seconds)
      sections.push({
        type: 'timer',
        text: '5... 4... 3... 2... 1...',
        start: currentTime.toFixed(2),
        end: (currentTime + 5).toFixed(2)
      });

      currentTime += 5;

      // Post-timer section
      const postTimerWords = scriptParts[1].trim().split(/\s+/).length;
      const postTimerDuration = postTimerWords / 2.5;

      sections.push({
        type: 'answer',
        text: scriptParts[1].trim(),
        start: currentTime.toFixed(2),
        end: (currentTime + postTimerDuration).toFixed(2)
      });

      currentTime += postTimerDuration;
    } else {
      // No countdown, simple duration calculation
      const words = script.split(/\s+/).filter(word => word.length > 0);
      const duration = words.length / 2.5;

      sections.push({
        type: 'full',
        text: script,
        start: '0.00',
        end: duration.toFixed(2)
      });

      currentTime = duration;
    }

    return new Response(
      JSON.stringify({
        success: true,
        captions: sections,
        total_duration: currentTime.toFixed(2),
        has_timer: hasCountdown
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});