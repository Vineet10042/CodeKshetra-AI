import { useState, useRef, useEffect } from 'react';
import { Pause, Play, FastForward, Rewind, Settings, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const Editorial = ({ title, secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };
  const youtubeId = getYouTubeId(secureUrl);

  // States for animations
  const [showForward, setShowForward] = useState(false);
  const [showBackward, setShowBackward] = useState(false);
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);

  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState('main'); // 'main', 'speed', 'resolution'
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentResolution, setCurrentResolution] = useState('Auto');
  const [videoUrl, setVideoUrl] = useState(secureUrl);
  const timeToSeek = useRef(0);

  useEffect(() => {
    setVideoUrl(secureUrl);
    setCurrentResolution('Auto');
  }, [secureUrl]);

  const getTransformedUrl = (url, resolution) => {
    if (!url || !url.includes('/upload/') || resolution === 'Auto') return url;
    const height = resolution.replace('p', '');
    return url.replace('/upload/', `/upload/h_${height}/`);
  };

  const handleResolutionChange = (res) => {
    if (res !== currentResolution && videoRef.current) {
      // Save current time slightly before to avoid loading issues occasionally
      timeToSeek.current = videoRef.current.currentTime;
      setCurrentResolution(res);
      setVideoUrl(getTransformedUrl(secureUrl, res));
    }
    setActiveMenu('main');
    setShowSettings(false);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setActiveMenu('main');
    setShowSettings(false);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (timeToSeek.current > 0) {
        videoRef.current.currentTime = timeToSeek.current;
        setCurrentTime(timeToSeek.current);
        timeToSeek.current = 0;
      }
      videoRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        // Need to wrap play in a promise block to avoid race conditions
        videoRef.current.play().catch(e => console.error("Playback failed", e));
      }
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (showSettings) {
      setShowSettings(false);
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);

      // Trigger center animation
      setShowPlayPauseAnim(true);
      setTimeout(() => setShowPlayPauseAnim(false), 500);
    }
  };

  const handleDoubleClick = (e) => {
    if (!videoRef.current) return;

    // Prevent default to avoid selection issues
    e.preventDefault();
    if (showSettings) {
      setShowSettings(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width / 2) {
      // Left side double click -> rewind 10s
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      setShowBackward(true);
      setTimeout(() => setShowBackward(false), 500);
    } else {
      // Right side double click -> forward 10s
      const maxVideoDuration = videoRef.current.duration || duration || 0;
      videoRef.current.currentTime = Math.min(maxVideoDuration, videoRef.current.currentTime + 10);
      setShowForward(true);
      setTimeout(() => setShowForward(false), 500);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    }

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      }
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div
        className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-base-content/10 group bg-black/5 backdrop-blur-sm"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setShowSettings(false); }}
      >
        {youtubeId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video bg-black"
          ></iframe>
        ) : (
          <>
            {/* Video Element */}
            <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          onClick={togglePlayPause}
          onDoubleClick={handleDoubleClick}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full aspect-video bg-black cursor-pointer object-contain"
        />

        {/* Settings Panel Component (positioned absolute inside video container) */}
        {showSettings && (
          <div
            className="absolute bottom-16 right-4 w-52 bg-black/90 backdrop-blur rounded-lg shadow-xl overflow-y-auto z-30 transition-all text-sm border border-white/20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{ maxHeight: "220px" }}
          >
            <div className="p-2">
              {activeMenu === 'main' && (
                <ul className="flex flex-col gap-1 w-full text-base-content m-0 p-0">
                  <li>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu('resolution'); }} className="flex justify-between items-center py-2 px-3 w-full rounded text-white hover:bg-white/20 transition-colors">
                      <span className="font-semibold text-white">Resolution</span>
                      <div className="flex items-center gap-1 text-white/70">
                        <span>{currentResolution}</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  </li>
                  <li>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu('speed'); }} className="flex justify-between items-center py-2 px-3 w-full rounded text-white hover:bg-white/20 transition-colors">
                      <span className="font-semibold text-white">Speed</span>
                      <div className="flex items-center gap-1 text-white/70">
                        <span>{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  </li>
                </ul>
              )}

              {activeMenu === 'resolution' && (
                <div className="w-full">
                  <button className="flex items-center cursor-pointer mb-2 px-2 pb-2 pt-1 border-b border-white/20 text-white/70 hover:text-white w-full gap-1" onClick={(e) => { e.stopPropagation(); setActiveMenu('main'); }}>
                    <ChevronLeft size={16} />
                    <span className="font-semibold text-white">Resolution</span>
                  </button>
                  <ul className="flex flex-col w-full text-base-content m-0 p-0">
                    {['Auto', '720p', '480p', '360p', '144p'].map((res) => (
                      <li key={res}>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleResolutionChange(res);
                        }} className="flex items-center gap-2 py-2 px-3 w-full rounded text-white hover:bg-white/20 transition-colors">
                          <div className="w-4 flex justify-center">{currentResolution === res && <Check size={14} />}</div>
                          <span>{res}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeMenu === 'speed' && (
                <div className="w-full">
                  <button className="flex items-center cursor-pointer mb-2 px-2 pb-2 pt-1 border-b border-white/20 text-white/70 hover:text-white w-full gap-1" onClick={(e) => { e.stopPropagation(); setActiveMenu('main'); }}>
                    <ChevronLeft size={16} />
                    <span className="font-semibold text-white">Playback Speed</span>
                  </button>
                  <ul className="flex flex-col w-full text-base-content m-0 p-0">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].map((speed) => (
                      <li key={speed}>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleSpeedChange(speed);
                        }} className="flex items-center gap-2 py-2 px-3 w-full rounded text-white hover:bg-white/20 transition-colors">
                          <div className="w-4 flex justify-center">{playbackSpeed === speed && <Check size={14} />}</div>
                          <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Click Animations */}
        {showPlayPauseAnim && !showForward && !showBackward && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 pointer-events-none animate-ping opacity-80 flex items-center justify-center">
            {isPlaying ? <Play size={40} fill="white" className="text-white ml-2" /> : <Pause size={40} fill="white" className="text-white" />}
          </div>
        )}

        {showBackward && (
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-6 pointer-events-none flex flex-col items-center justify-center animate-pulse z-10">
            <Rewind size={32} fill="white" className="text-white mb-2" />
            <span className="text-white font-bold text-md">-10s</span>
          </div>
        )}

        {showForward && (
          <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-6 pointer-events-none flex flex-col items-center justify-center animate-pulse z-10">
            <FastForward size={32} fill="white" className="text-white mb-2" />
            <span className="text-white font-bold text-md">+10s</span>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6 pt-16 transition-all duration-300 ${isHovering || !isPlaying || showSettings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } z-20`}
        >
          <div className="flex items-center w-full gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="btn btn-circle btn-primary btn-sm border-none shadow-md hover:scale-105 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" strokeWidth={1} />
              ) : (
                <Play size={18} fill="currentColor" strokeWidth={1} className="ml-1" />
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex items-center flex-1 gap-2">
              <span className="text-white text-xs font-mono w-10 text-right drop-shadow-md">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || (videoRef.current ? videoRef.current.duration : 100) || 100}
                value={currentTime || 0}
                onChange={(e) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Number(e.target.value);
                    setCurrentTime(Number(e.target.value));
                  }
                }}
                className="range range-primary range-xs flex-1 cursor-pointer"
              />
              <span className="text-white text-xs font-mono w-10 drop-shadow-md">
                {formatTime(duration || (videoRef.current && !isNaN(videoRef.current.duration) ? videoRef.current.duration : 0))}
              </span>
            </div>

            {/* Settings Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                if (!showSettings) setActiveMenu('main'); // reset menu when opening
              }}
              className={`btn btn-circle btn-sm btn-ghost cursor-pointer text-white hover:bg-white/20 transition-transform ${showSettings ? 'rotate-90' : ''}`}
              aria-label="Settings"
            >
              {/* Uses a simple hollow settings shape */}
              <Settings size={20} className="text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Problem Title below video container */}
      {title && (
        <div className="w-full max-w-4xl mx-auto mt-8 px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary/80">Official Solution</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h3>
          <p className="text-base-content/60 mt-3 max-w-2xl" >Watch our detailed step-by-step video editorial explaining the optimal approach, algorithm, and time complexity for solving this problem.</p>
        </div>
      )}
    </div>
  );
};

export default Editorial;