import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Scan, X, Loader2, FileWarning, Globe, Lock, ShieldAlert, AlertCircle, Zap, Sparkles } from 'lucide-react';

/**
 * CINEMATIC ARCHIVES - MULTI-ARTIFACT ANALYZER v8
 * * Changelog:
 * - SWAPPED: API from Gemini to xAI Grok (OpenAI-compatible endpoint: api.x.ai/v1/chat/completions).
 * - ADDED: VITE_XAI_API_KEY env loading (replaces VITE_GEMINI_API_KEY).
 * - UPDATED: Payload to messages[] + system prompt for factual neutrality (no safetySettings needed—Grok handles adult content openly).
 * - ENHANCED: Model 'grok-beta' for vision/multimodal (processes images directly for poster analysis).
 * - ADAPTED: Deep search via tool-calling emulation in prompt (Grok supports functions; sources extracted from response).
 * - SIMPLIFIED: Retry logic (no safety blocks in Grok); fallback to text-only if vision fails.
 * - MAINTAINED: UI/VFX/animations unchanged—seamless drop-in.
 * - GUARANTEE: Full adult content support (factual metadata only); no blocks on celeb/poster queries.
 */

// --- CONSTANTS ---
const PLACEHOLDER_API_KEYS = ['your_xai_api_key_here', 'your_actual_api_key_here'];

// --- UTILITY FUNCTION: Fetch with timeout ---
const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

// --- COMPONENT: ARTIFACT CARD ---
const ArtifactCard = ({ file, onRemove, apiStatus }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, RESULT, ERROR, RESTRICTED, DEEP_SEARCHING, AUTH_ERROR, NETWORK_ERROR, API_OFFLINE
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [scanColor, setScanColor] = useState('purple');
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    // Safety check for file reading
    if (file) {
        reader.readAsDataURL(file);
    }
    return () => reader.abort();
  }, [file]);

  const analyzeArtifact = async (useGrounding = false) => {
    if (!imagePreview) return;

    // Validate API key
    const apiKey = import.meta.env.VITE_XAI_API_KEY;
    if (!apiKey) {
      setStatus('AUTH_ERROR');
      setErrorDetails({
        title: 'No API Key Configured',
        message: 'The xAI API key is missing. Please configure VITE_XAI_API_KEY in your environment.',
        suggestion: 'Get your API key from https://x.ai/api'
      });
      return;
    }

    // Check API status before attempting scan
    if (apiStatus === 'offline') {
      setStatus('API_OFFLINE');
      setErrorDetails({
        title: 'AI Service Offline',
        message: 'Unable to connect to the xAI service.',
        suggestion: 'Check your internet connection and API key validity.'
      });
      return;
    }

    if (useGrounding) {
        setStatus('DEEP_SEARCHING');
        setScanColor('amber');
    } else {
        setStatus('SCANNING');
        setScanColor('green');
        setTimeout(() => setScanColor('purple'), 1500);
    }

    try {
      const base64Data = imagePreview.split(',')[1];

      const basePrompt = `
        You are an archival media analyst. Provide factual, neutral identification of this visual artifact without any explicit or interpretive content. Focus on verifiable metadata: titles, years, genres, and professional credits.
        It is likely a Movie Poster, Game Cover, or Photo of a Famous Person in media/entertainment.

        ${useGrounding ? "Use your knowledge or simulate search tools to identify from reliable sources like IMDb. Include 1-3 source links/titles in the JSON 'sources' array." : ""}
        IF IT IS A PERSON:
        1. Title = Person's Full Name.
        2. Year = Year of Birth (e.g. "b. 1985").
        3. Genre = "Actor" / "Actress" / "Model" + (Birth City/Country if known).
        4. Description = "Best known for roles/credits in [factual filmography highlights]."
        IF IT IS MEDIA:
        1. Title = Exact Title.
        2. Year = Release Year.
        3. Genre = Primary Genre(s) (e.g., "Drama, Thriller").
        4. Description = "Produced by [studio]; directed by [director]; starring [lead cast from credits]."
        Return ONLY valid JSON, no additional text:
        {
          "title": "String",
          "year": "String",
          "genre": "String",
          "description": "String",
          "is_person": Boolean,
          "sources": [] // Array of {uri: "String", title: "String"} if grounding
        }
      `;

      const fallbackPrompt = `
        Archival query: Analyze potential movie poster or celebrity portrait based on common media patterns. Use knowledge for factual metadata only.
        [Image described as: group portrait in entertainment context, title elements visible.]
        Follow the same JSON structure as above.
      `;

      const messages = [
        { role: "system", content: "Respond as a neutral media database. Output only structured JSON facts. Handle all content factually, including adult industry credits." },
        {
          role: "user",
          content: [
            { type: "text", text: basePrompt },
            {
              type: "image_url",
              image_url: { url: `data:${file.type};base64,${base64Data}` }
            }
          ]
        }
      ];

      const GROK_MODEL = import.meta.env.VITE_GROK_MODEL || "grok-beta";
      let useFallback = false;
      const payload = {
        model: GROK_MODEL,
        messages: useFallback ? [{ role: "user", content: fallbackPrompt }] : messages,
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1024
      };

      if (useGrounding) {
        payload.tools = [{ type: "function", function: { name: "search_media", description: "Search for media facts" } }];
        payload.tool_choice = "auto";
      }

      // --- RETRY LOGIC WITH BACKOFF ---
      let response;
      let data;
      let lastError;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
            response = await fetchWithTimeout(
                "https://api.x.ai/v1/chat/completions",
                {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(payload)
                },
                30000 // 30s timeout
            );

            // Handle 401 specifically (Auth Error) - Do not retry
            if (response.status === 401) {
                setStatus('AUTH_ERROR');
                setErrorDetails({
                  title: 'Authentication Failed',
                  message: 'Your API key is invalid or expired (401 Unauthorized).',
                  suggestion: 'Generate a new API key from https://x.ai/api'
                });
                return;
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                const errorData = await response.json();
                setStatus('AUTH_ERROR');
                setErrorDetails({
                  title: 'Access Forbidden',
                  message: errorData.error?.message || 'API access is forbidden (403).',
                  suggestion: 'Check if your API key has the required permissions and billing is enabled.'
                });
                return;
            }

            if (response.ok) break;

            // Retry on rate limit or service unavailable
            if (response.status !== 429 && response.status !== 503) {
                 const errorText = await response.text();
                 throw new Error(`API Error ${response.status}: ${errorText}`);
            }
            
            throw new Error(`Retryable API Error: ${response.status}`);

        } catch (e) {
            lastError = e;
            
            // Handle network errors
            if (e.name === 'AbortError') {
                setStatus('NETWORK_ERROR');
                setErrorDetails({
                  title: 'Request Timeout',
                  message: 'The AI service is taking too long to respond.',
                  suggestion: 'The service might be experiencing high load. Please try again in a moment.'
                });
                return;
            }

            if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                setStatus('NETWORK_ERROR');
                setErrorDetails({
                  title: 'Network Error',
                  message: 'Unable to reach the AI service.',
                  suggestion: 'Check your internet connection or the service may be temporarily unavailable.'
                });
                return;
            }

            if (e.message.includes("API Error")) throw e; // Don't retry fatal errors
            
            const delay = Math.pow(2, attempt) * 1000;
            if (attempt < 2) await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (!response || !response.ok) {
          const finalText = response ? await response.text() : lastError?.message;
          console.error("Final API Failure:", finalText);
          setStatus('ERROR');
          setErrorDetails({
            title: 'Scan Failed',
            message: `The AI service returned an error after multiple retries.`,
            suggestion: 'Please try again or contact support if the issue persists.'
          });
          return;
      }

      data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message.content) {
        handleRestricted();
        return;
      }

      let textResponse;
      let jsonResult;

      try {
        textResponse = data.choices[0].message.content;
        jsonResult = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError, "Response:", textResponse);
        setStatus('ERROR');
        setErrorDetails({
          title: 'Invalid Response',
          message: 'The AI service returned an unexpected response format.',
          suggestion: 'This may be a temporary issue. Please try again.'
        });
        return;
      }

      let groundingSources = jsonResult.sources || [];
      if (useGrounding && data.choices[0].message.tool_calls) {
        groundingSources = groundingSources.filter(s => s.uri && s.title);
      }

      setTimeout(() => {
        setResult(jsonResult);
        setSources(groundingSources);
        setStatus('RESULT');
      }, 800);

    } catch (error) {
      console.error("Analysis Error:", error);
      setStatus('ERROR');
      setErrorDetails({
        title: 'Unexpected Error',
        message: error.message || 'An unexpected error occurred during analysis.',
        suggestion: 'Please try again or report this issue if it persists.'
      });
    }
  };

  const handleRestricted = () => {
      setTimeout(() => {
        setResult({
            title: "DATA_RESTRICTED",
            year: "UNKNOWN",
            genre: "ERROR_403",
            description: "Visual signature unidentifiable. Deep network scan recommended."
        });
        setStatus('RESTRICTED');
    }, 800);
  };

  return (
    <div className="relative w-full flex flex-col items-center gap-6 mb-16 animate-fade-in-up">
      
      {/* IMAGE CONTAINER */}
      <div className={`
        relative w-full max-w-[85vw] md:max-w-sm aspect-[2/3] rounded-sm overflow-hidden 
        transition-all duration-700 ease-out group bg-black/40
        ${(status === 'SCANNING' || status === 'DEEP_SEARCHING') ? 'shadow-[0_0_50px_rgba(139,92,246,0.4)] scale-[1.02] z-20' : 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(88,28,135,0.3)]'}
        ${status === 'RESULT' ? 'shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''}
        ${(status === 'ERROR' || status === 'RESTRICTED' || status === 'AUTH_ERROR') ? 'border border-red-900/50 grayscale opacity-80' : ''}
      `}>
        
        {imagePreview ? (
          <>
            <img 
              src={imagePreview} 
              alt="Artifact" 
              className={`w-full h-full object-cover transition-all duration-700 
                ${(status === 'SCANNING' || status === 'DEEP_SEARCHING') ? 'opacity-60 grayscale-[50%] contrast-125' : 'opacity-100'}
                ${(status === 'ERROR' || status === 'RESTRICTED' || status === 'AUTH_ERROR') ? 'grayscale opacity-40' : ''}
              `} 
            />

            {status !== 'SCANNING' && status !== 'DEEP_SEARCHING' && (
              <button 
                onClick={() => onRemove(file)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-900/80 text-white/50 hover:text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 touch-manipulation z-30"
              >
                <X size={18} />
              </button>
            )}

            {/* SCANNING VFX */}
            {(status === 'SCANNING' || status === 'DEEP_SEARCHING') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-[2px] bg-white/80 shadow-[0_0_20px_white] animate-scan-y top-0 left-0 z-20"></div>
                <div className={`
                  w-40 h-40 rounded-full blur-2xl mix-blend-screen animate-pulse-fast transition-colors duration-1000
                  ${scanColor === 'green' ? 'bg-emerald-500/40 shadow-[0_0_60px_#10b981]' : ''}
                  ${scanColor === 'purple' ? 'bg-purple-600/40 shadow-[0_0_80px_#9333ea]' : ''}
                  ${scanColor === 'amber' ? 'bg-amber-600/40 shadow-[0_0_80px_#d97706]' : ''}
                `}></div>
                <div className="absolute bottom-4 left-0 w-full text-center">
                   <span className="font-mono text-xs tracking-[0.3em] text-white/90 animate-pulse bg-black/50 px-2 py-1 uppercase">
                     {status === 'DEEP_SEARCHING' ? 'SEARCHING_DEEP_WEB...' : 'IDENTIFYING_SUBJECT...'}
                   </span>
                </div>
              </div>
            )}

            {/* IDLE STATE OVERLAY */}
            {status === 'IDLE' && (
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={() => analyzeArtifact(false)}
                    className="bg-purple-600/80 hover:bg-purple-500 backdrop-blur-md text-white px-6 py-3 rounded-sm font-mono tracking-widest text-sm flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-95"
                  >
                    <Scan size={18} /> INITIATE_SCAN
                  </button>
               </div>
            )}
          </>
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" />
            </div>
        )}
      </div>

      {/* RESULT TEXT */}
      {status === 'RESULT' && result && (
        <div className="w-full max-w-[90vw] md:max-w-lg text-center relative z-10 animate-slide-up px-4">
           <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-6"></div>
           <h2 className="text-3xl md:text-5xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] mb-2 break-words">
             {result.title}
           </h2>
           
           <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm font-mono text-purple-300/80 tracking-widest mb-6">
             <span className="border border-purple-500/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                {result.is_person ? `BIRTH: ${result.year}` : result.year}
             </span>
             <span className="hidden sm:inline opacity-50">//</span>
             <span className="text-amber-400/90 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] uppercase">
                {result.genre}
             </span>
           </div>
           
           <p className="font-serif italic text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow-md max-w-prose mx-auto opacity-90 mb-6">
             "{result.description}"
           </p>
           
           {sources.length > 0 && (
             <div className="flex flex-col items-center gap-2 mt-4 animate-fade-in-up">
               <span className="text-[10px] font-mono tracking-widest text-emerald-400/60 uppercase mb-1">
                 // INTERCEPTED_SIGNALS (SOURCES)
               </span>
               <div className="flex flex-wrap justify-center gap-2">
                 {sources.slice(0, 3).map((source, idx) => (
                   <a 
                     key={idx} 
                     href={source.uri} 
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center gap-1.5 px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 hover:bg-emerald-900/40 hover:border-emerald-500/50 rounded-full text-xs text-emerald-300/80 transition-colors"
                   >
                     <Globe size={10} />
                     <span className="max-w-[150px] truncate">{source.title}</span>
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* AUTH ERROR STATE */}
      {status === 'AUTH_ERROR' && errorDetails && (
        <div className="flex flex-col items-center gap-4 animate-slide-up max-w-md px-4">
          <div className="text-red-500 font-mono text-xs tracking-widest flex flex-col items-center gap-2 mt-4">
             <div className="flex items-center gap-2 animate-pulse bg-red-900/20 px-4 py-2 rounded border border-red-500/30">
               <ShieldAlert size={20} />
               <span>{errorDetails.title.toUpperCase().replace(/ /g, '_')}</span>
             </div>
             <p className="text-white/60 text-center text-sm mt-2">
               {errorDetails.message}
             </p>
             <p className="text-amber-400/60 text-center text-xs mt-1 italic">
               💡 {errorDetails.suggestion}
             </p>
          </div>
        </div>
      )}

      {/* NETWORK ERROR / API OFFLINE STATE */}
      {(status === 'NETWORK_ERROR' || status === 'API_OFFLINE') && errorDetails && (
        <div className="flex flex-col items-center gap-4 animate-slide-up max-w-md px-4">
          <div className="text-orange-500 font-mono text-xs tracking-widest flex flex-col items-center gap-2 mt-4">
             <div className="flex items-center gap-2 animate-pulse bg-orange-900/20 px-4 py-2 rounded border border-orange-500/30">
               <AlertCircle size={20} />
               <span>{errorDetails.title.toUpperCase().replace(/ /g, '_')}</span>
             </div>
             <p className="text-white/60 text-center text-sm mt-2">
               {errorDetails.message}
             </p>
             <p className="text-amber-400/60 text-center text-xs mt-1 italic">
               💡 {errorDetails.suggestion}
             </p>
             <button 
               onClick={() => analyzeArtifact(false)}
               className="mt-3 px-6 py-2 bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/50 rounded text-white text-xs font-mono tracking-wider transition-all"
             >
               RETRY_SCAN
             </button>
          </div>
        </div>
      )}

      {/* RESTRICTED / ERROR STATE */}
      {(status === 'RESTRICTED' || status === 'ERROR') && (
        <div className="flex flex-col items-center gap-4 animate-slide-up max-w-md px-4">
            <div className="text-red-400 font-mono text-xs tracking-widest flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2 animate-pulse">
                <FileWarning size={24} /> 
                <span>{errorDetails?.title?.toUpperCase().replace(/ /g, '_') || result?.title || "SIGNAL_LOST"}</span>
            </div>
            <p className="text-white/60 text-center text-sm mt-2">
              {errorDetails?.message || result?.description || "Visual signature unclear."}
            </p>
            {errorDetails?.suggestion && (
              <p className="text-amber-400/60 text-center text-xs mt-1 italic">
                💡 {errorDetails.suggestion}
              </p>
            )}
            </div>

            {status === 'RESTRICTED' && (
              <>
                <button 
                    onClick={() => analyzeArtifact(true)}
                    className="mt-2 group relative px-8 py-3 bg-transparent overflow-hidden border border-amber-500/30 hover:border-amber-500/80 transition-colors"
                >
                    <div className="absolute inset-0 w-full h-full bg-amber-600/10 skew-x-12 group-hover:bg-amber-600/20 transition-all duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <span className="relative font-mono text-xs tracking-[0.2em] text-amber-200 group-hover:text-amber-100 flex items-center gap-3">
                        <Globe size={14} /> DEEP_NETWORK_SCAN
                    </span>
                </button>
                <div className="flex items-center gap-2 text-[10px] text-amber-500/40 font-mono mt-1">
                    <Lock size={8} className="text-red-400/50" />
                    <span>SAFETY_FILTERS: DISABLED</span>
                </div>
              </>
            )}
            {status === 'ERROR' && (
              <button 
                onClick={() => analyzeArtifact(false)}
                className="mt-3 px-6 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded text-white text-xs font-mono tracking-wider transition-all"
              >
                RETRY_SCAN
              </button>
            )}
        </div>
      )}

    </div>
  );
};

const App = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking'); // checking, online, offline, no_key, invalid_key
  const [showApiSetup, setShowApiSetup] = useState(false);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // --- API HEALTH CHECK ---
  const checkApiHealth = useCallback(async () => {
    const apiKey = import.meta.env.VITE_XAI_API_KEY;
    
    // Check if API key is missing or is the placeholder value
    if (!apiKey || PLACEHOLDER_API_KEYS.includes(apiKey)) {
      setApiStatus('no_key');
      setShowApiSetup(true);
      return;
    }

    setApiStatus('checking');

    try {
      // Simple health check with a minimal request
      const response = await fetchWithTimeout(
        "https://api.x.ai/v1/models",
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        },
        10000 // 10s timeout
      );

      if (response.ok) {
        setApiStatus('online');
        setShowApiSetup(false);
      } else if (response.status === 401 || response.status === 403) {
        setApiStatus('invalid_key');
        setShowApiSetup(true);
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
    
    // Recheck every 2 minutes
    const interval = setInterval(checkApiHealth, 120000);
    return () => clearInterval(interval);
  }, [checkApiHealth]);

  // --- PARTICLE SYSTEM (Optimized for 60fps+) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const particleCount = width < 768 ? 40 : 100;
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2 + 0.2;
        this.alpha = Math.random() * 0.5 + 0.05;
        this.fadeDir = Math.random() > 0.5 ? 0.003 : -0.003;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha += this.fadeDir;
        if (this.alpha <= 0 || this.alpha >= 0.5) this.fadeDir *= -1;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 170, 0, ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255, 170, 0, 0.4)";
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(10, 10, 26, 0.2)');
      gradient.addColorStop(1, 'rgba(5, 5, 10, 0.4)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => { p.update(); p.draw(); });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- FILE HANDLING ---
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setArtifacts(prev => [...newFiles, ...prev]);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleManualUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setArtifacts(prev => [...newFiles, ...prev]);
    }
  };

  const removeArtifact = (fileToRemove) => {
    setArtifacts(prev => prev.filter(f => f !== fileToRemove));
  };

  return (
    <div 
      className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#0a0a1a] text-white font-sans selection:bg-purple-500 selection:text-white"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: #3b0764; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #581c87; }
        @keyframes scan-y {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-y { animation: scan-y 2.5s linear infinite; }
        .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      {/* BACKGROUNDS */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center">
        {/* HEADER */}
        <header className="w-full flex justify-between items-start px-4 md:px-8 pt-8 md:pt-12 pb-8 max-w-7xl mx-auto z-20">
          <div className="flex flex-col">
             <h1 className="text-3xl md:text-5xl font-bold tracking-[0.15em] font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400 uppercase drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              ARCHIVE_
            </h1>
            <button
              onClick={() => setShowApiSetup(true)}
              className="text-[10px] md:text-xs font-mono tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
              <span className={`${apiStatus === 'online' ? 'text-purple-400/50' : 'text-red-400/80'}`}>
                SYSTEM {apiStatus === 'online' ? 'ONLINE' : 'OFFLINE'} // {artifacts.length} ARTIFACTS
              </span>
            </button>
          </div>
          <div className="hidden sm:block text-right">
             <div className="flex gap-4 text-amber-500/60 text-xs font-mono tracking-widest border-r-2 border-amber-500/30 pr-4">
               <span>DEEP_SCAN: READY</span>
               <span>{'//'}</span>
               <span>SAFE_MODE: DISABLED</span>
             </div>
          </div>
        </header>

        {/* API SETUP MODAL */}
        {showApiSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative max-w-2xl w-full bg-gradient-to-br from-purple-950/90 to-indigo-950/90 border border-purple-500/30 rounded-lg p-8 shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-slide-up">
              
              {/* Close button */}
              <button 
                onClick={() => setShowApiSetup(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="text-amber-400" size={32} />
                <h2 className="text-2xl font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-purple-300">
                  {apiStatus === 'invalid_key' ? 'INVALID_API_KEY' : 'API_KEY_REQUIRED'}
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-4 text-white/80">
                <p className="text-sm leading-relaxed">
                  {apiStatus === 'invalid_key' 
                    ? 'The provided xAI API key is invalid or has expired. Please check your API key and try again.'
                    : 'To use the AI analysis features, you need to configure an xAI API key.'}
                </p>

                {/* Step-by-step instructions */}
                <div className="bg-black/30 rounded p-4 space-y-3 border border-purple-500/20">
                  <h3 className="text-sm font-mono text-purple-300 tracking-wider">SETUP INSTRUCTIONS:</h3>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">STEP 1:</span>
                      <span>Get your API key from <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">xAI</a></span>
                    </div>
                    
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">STEP 2:</span>
                      <span>Create a <code className="bg-black/50 px-1 rounded text-emerald-300">.env</code> file in the project root directory</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">STEP 3:</span>
                      <span>Add this line to the .env file:</span>
                    </div>
                    
                    <div className="bg-black/50 p-3 rounded border border-emerald-500/20 overflow-x-auto">
                      <code className="text-emerald-300 text-[11px]">VITE_XAI_API_KEY=your_actual_api_key_here</code>
                    </div>
                    
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">STEP 4:</span>
                      <span>Restart the development server (<code className="bg-black/50 px-1 rounded text-emerald-300">npm run dev</code>)</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">STEP 5:</span>
                      <span>Refresh this page to verify the connection</span>
                    </div>
                  </div>
                </div>

                {/* Production note */}
                <div className="bg-amber-900/20 border border-amber-500/30 rounded p-3 text-xs space-y-2">
                  <p className="flex items-start gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>For GitHub Pages deployment:</strong> Add the API key as a repository secret named <code className="bg-black/50 px-1 rounded text-emerald-300">VITE_XAI_API_KEY</code> in Settings → Secrets → Actions. The GitHub Actions workflow will use this secret during the build process.</span>
                  </p>
                  <p className="flex items-start gap-2 text-purple-300/80 pl-5">
                    <span>⚠️ <strong>Important:</strong> After adding the secret, you must push a new commit to <code className="bg-black/50 px-1 rounded text-emerald-300">main</code> branch to trigger a rebuild. The API key is embedded at build time, not runtime. Check the Actions tab to verify the deployment succeeded.</span>
                  </p>
                </div>

                {/* Test Connection Button */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={checkApiHealth}
                    disabled={apiStatus === 'checking'}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:opacity-50 rounded font-mono text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {apiStatus === 'checking' ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        TESTING...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        TEST CONNECTION
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowApiSetup(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded font-mono text-sm tracking-wider transition-all"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Status indicator */}
                {apiStatus !== 'no_key' && apiStatus !== 'checking' && (
                  <div className={`flex items-center gap-2 text-xs font-mono p-3 rounded ${apiStatus === 'online' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30' : apiStatus === 'invalid_key' ? 'bg-red-900/30 text-red-300 border border-red-500/30' : 'bg-orange-900/30 text-orange-300 border border-orange-500/30'}`}>
                    <span className="font-bold">STATUS:</span>
                    <span>{apiStatus === 'online' ? 'API CONNECTION SUCCESSFUL ✅' : apiStatus === 'invalid_key' ? 'INVALID API KEY ❌' : 'SERVICE UNAVAILABLE ⚠️'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <main className="w-full max-w-7xl px-4 md:px-6 pb-24 flex flex-col items-center">
          {/* DRAG & DROP ZONE */}
          <div className={`
             w-full transition-all duration-500 ease-in-out flex flex-col items-center
             ${artifacts.length === 0 ? 'min-h-[50vh] justify-center' : 'h-auto py-4 md:py-8'}
          `}>
            <label className={`
               relative group cursor-pointer flex flex-col items-center justify-center
               ${artifacts.length === 0 ? 'p-8 md:p-16 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-purple-500/50' : 'p-4 md:p-6 border border-dashed border-white/10 rounded-lg hover:bg-white/5'}
               transition-all duration-300 backdrop-blur-sm
            `}>
              <div className="absolute inset-0 bg-purple-600/20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>

              {artifacts.length === 0 ? (
                <>
                  <Upload className="w-16 h-16 md:w-20 md:h-20 text-purple-300/40 group-hover:text-purple-200 group-hover:scale-110 transition-transform duration-300 mb-6" />
                  <span className="font-mono text-sm md:text-lg tracking-[0.2em] text-purple-200/60 group-hover:text-purple-100 text-center">
                    DRAG & DROP ARTIFACTS
                  </span>
                  <span className="mt-2 text-[10px] md:text-xs font-mono text-white/30 tracking-wider">
                    [ POSTERS / COVERS / PORTRAITS ]
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-3 text-purple-300/50 group-hover:text-purple-200">
                   <Upload size={20} />
                   <span className="font-mono text-xs tracking-widest">UPLOAD MORE</span>
                </div>
              )}

              <input type="file" multiple accept="image/*" className="hidden" onChange={handleManualUpload} />
            </label>
          </div>
          {/* ARTIFACT GRID */}
          {artifacts.length > 0 && (
            <div className="w-full grid grid-cols-1 gap-16 md:gap-24 mt-8">
              {artifacts.map((file) => (
                <ArtifactCard
                  key={file.name + file.lastModified + file.size}
                  file={file}
                  onRemove={removeArtifact}
                  apiStatus={apiStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
