import { useEffect, useRef, useState } from "react";

const pitchNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SoundBox = ({ LIGHTARR, sampler }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const playedNotes = useRef(new Set());
  const animationRef = useRef(null);
  const activeNotes = useRef(new Map()); // Track currently playing notes

  const [currentTime, setCurrentTime] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const pixelsPerSecond = 100;
  const keyHeight = 20;
  const timelinePadding = 1;
  const playheadPosition = 0.2; // 20% of screen width for playhead position

  // Generate MIDI pitches (21-108 covers 88 piano keys, from C8 to A0)
  const midiPitches = [];
  for (let i = 108; i >= 21; i--) {
    const octave = Math.floor(i / 12) - 1;
    const note = pitchNames[i % 12];
    midiPitches.push({ name: `${note}${octave}`, number: i });
  }

  const totalDuration = (LIGHTARR && LIGHTARR.length > 0) 
    ? Math.max(...LIGHTARR.map(n => n.time + n.duration / 1000)) + 2
    : 10;
  const contentWidth = Math.max(totalDuration * pixelsPerSecond, containerWidth);
  const totalHeight = midiPitches.length * keyHeight; // Total height for all keys

  const stopAllNotes = () => {
    // Stop all currently playing notes
    activeNotes.current.forEach((noteId, noteData) => {
      if (sampler && sampler.releaseAll) {
        sampler.releaseAll();
      }
    });
    activeNotes.current.clear();
  };

  const playNote = (note, duration) => {
    if (sampler && sampler.triggerAttackRelease) {
      const noteId = `${note.name}-${note.time}`;
      if (!activeNotes.current.has(noteId)) {
        activeNotes.current.set(noteId, note);
        sampler.triggerAttackRelease(note.name, duration, undefined, note.velocity || 0.8);
        
        // Remove from active notes after duration
        setTimeout(() => {
          activeNotes.current.delete(noteId);
        }, duration * 1000);
      }
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setStartTime(null);
    setCurrentTime(0);
    playedNotes.current.clear();
    stopAllNotes();
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const startPlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    
    if (!sampler) {
      console.warn("No sampler available");
      return;
    }
    
    setIsPlaying(true);
    setStartTime(performance.now());
    playedNotes.current.clear();
    activeNotes.current.clear();
  };

  const seekToTime = (time) => {
    const wasPlaying = isPlaying;
    stopPlayback();
    setCurrentTime(time);
    
    if (wasPlaying) {
      // Restart playback from new position
      setTimeout(() => {
        setIsPlaying(true);
        setStartTime(performance.now() - (time * 1000));
        playedNotes.current.clear();
        activeNotes.current.clear();
      }, 50);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!startTime || !isPlaying) return;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      setCurrentTime(elapsed);

      // Auto-scroll logic
      const playheadX = elapsed * pixelsPerSecond;
      const fixedPlayheadX = containerWidth * playheadPosition;
      
      if (scrollRef.current) {
        const scrollLeft = Math.max(0, playheadX - fixedPlayheadX);
        scrollRef.current.scrollLeft = scrollLeft;
      }

      // Play notes that should start at current time
      if (LIGHTARR && LIGHTARR.length > 0) {
        for (const note of LIGHTARR) {
          const noteStartTime = note.time;
          const noteEndTime = noteStartTime + (note.duration / 1000);
          const noteId = `${note.name}-${note.time}`;
          
          // Check if note should start playing now
          if (elapsed >= noteStartTime && elapsed < noteEndTime && !playedNotes.current.has(noteId)) {
            playedNotes.current.add(noteId);
            playNote(note, note.duration / 1000);
          }
        }
      }

      // Stop playback when we reach the end
      if (elapsed >= totalDuration) {
        stopPlayback();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startTime, isPlaying, containerWidth, totalDuration, LIGHTARR, sampler]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllNotes();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const isBlackKey = (noteName) => {
    return noteName.includes('b') || noteName.includes('#');
  };

  const getCurrentPlayheadX = () => {
    return currentTime * pixelsPerSecond;
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const scrollLeft = scrollRef.current?.scrollLeft || 0;
    const totalClickX = clickX + scrollLeft;
    const clickTime = Math.max(0, totalClickX / pixelsPerSecond);
    seekToTime(Math.min(clickTime, totalDuration));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Control Panel */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button 
            onClick={startPlayback}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <button 
            onClick={stopPlayback}
            className="px-4 py-2 rounded-md font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            ⏹ Stop
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-blue-400">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
          <div className="text-gray-400">
            Notes: {LIGHTARR ? LIGHTARR.length : 0}
          </div>
          <div className="text-gray-400">
            Instrument: {sampler ? 'Ready' : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Piano Roll */}
      <div ref={containerRef} className="flex-1 relative bg-gray-900 overflow-hidden">
        {/* Fixed Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-50 pointer-events-none shadow-lg"
          style={{ left: `${containerWidth * playheadPosition}px` }}
        />

        <div className="flex h-full">
          {/* Piano Keys (Fixed Left Panel) */}
          <div className="w-20 bg-gray-800 flex-shrink-0 border-r border-gray-600 z-40">
            {/* Time ruler spacer to align with timeline */}
            <div className="h-6 bg-gray-700 border-b border-gray-600"></div>
            
            {/* Scrollable keys container */}
            <div 
              className="overflow-y-auto overflow-x-hidden"
              style={{ 
                height: `calc(100% - 24px)`, // Account for time ruler height
                scrollbarWidth: 'none'
              }}
              onScroll={(e) => {
                // Sync scroll with timeline
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = e.target.scrollTop;
                }
              }}
            >
              <div style={{ height: totalHeight }}>
                {midiPitches.map((pitch, idx) => (
                  <div
                    key={pitch.name}
                    className={`flex items-center justify-center text-xs font-mono border-b border-gray-600 cursor-pointer transition-colors ${
                      isBlackKey(pitch.name) 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                    style={{ height: keyHeight }}
                    onClick={() => {
                      if (sampler) {
                        sampler.triggerAttackRelease(pitch.name, "8n");
                      }
                    }}
                  >
                    {pitch.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Timeline */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto"
            style={{ scrollbarWidth: 'thin' }}
            onScroll={(e) => {
              // Sync vertical scroll with piano keys
              const pianoKeysContainer = e.target.parentElement.querySelector('.w-20 > div:last-child');
              if (pianoKeysContainer) {
                pianoKeysContainer.scrollTop = e.target.scrollTop;
              }
            }}
          >
            <div
              className="relative bg-gray-800 cursor-crosshair"
              style={{
                width: `${contentWidth}px`,
                height: `${totalHeight + 24}px`, // Add space for time ruler
              }}
              onClick={handleTimelineClick}
            >
              {/* Time ruler */}
              <div className="sticky top-0 left-0 right-0 h-6 bg-gray-700 border-b border-gray-600 z-30">
                {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex items-center"
                    style={{ left: `${i * pixelsPerSecond}px` }}
                  >
                    <div className="w-px h-full bg-gray-500" />
                    <span className="text-xs text-gray-400 ml-1">{formatTime(i)}</span>
                  </div>
                ))}
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0" style={{ top: '24px' }}>
                {/* Vertical grid lines (time markers) */}
                {Array.from({ length: Math.ceil(totalDuration * 4) }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 ${i % 4 === 0 ? 'w-px bg-gray-600' : 'w-px bg-gray-700'}`}
                    style={{ 
                      left: `${(i * pixelsPerSecond) / 4}px`,
                      height: `${totalHeight}px`
                    }}
                  />
                ))}
                
                {/* Horizontal grid lines (note separators) */}
                {midiPitches.map((pitch, idx) => (
                  <div
                    key={pitch.name}
                    className={`absolute left-0 right-0 border-b ${
                      isBlackKey(pitch.name) ? 'border-gray-700' : 'border-gray-600'
                    }`}
                    style={{ 
                      top: `${idx * keyHeight}px`,
                      height: keyHeight,
                      backgroundColor: isBlackKey(pitch.name) ? 'rgba(55, 65, 81, 0.3)' : 'rgba(75, 85, 99, 0.1)'
                    }}
                  />
                ))}
              </div>

              {/* Notes */}
              <div className="absolute inset-0" style={{ top: '24px' }}>
                {LIGHTARR && LIGHTARR.map((note, noteIdx) => {
                  const pitchIndex = midiPitches.findIndex(p => p.name === note.name);
                  if (pitchIndex === -1) return null;

                  const left = note.time * pixelsPerSecond;
                  const width = Math.max(4, (note.duration * pixelsPerSecond) / 1000);
                  const top = pitchIndex * keyHeight;
                  const isActive = isPlaying && currentTime >= note.time && currentTime < (note.time + note.duration / 1000);

                  return (
                    <div
                      key={`${note.name}-${noteIdx}-${note.time}`}
                      className={`absolute border rounded-sm cursor-pointer transition-all duration-75 ${
                        isActive 
                          ? 'bg-blue-300 border-blue-200 shadow-lg' 
                          : 'bg-blue-500 border-blue-400 hover:bg-blue-400'
                      }`}
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                        top: `${top + 2}px`,
                        height: `${keyHeight - 4}px`,
                        opacity: Math.max(0.6, note.velocity || 0.8),
                      }}
                      title={`${note.name} - ${(note.duration / 1000).toFixed(2)}s - Velocity: ${(note.velocity || 0.8).toFixed(2)}`}
                    />
                  );
                })}
              </div>

              {/* Moving Playhead (in timeline) */}
              <div
                className="absolute w-0.5 bg-yellow-400 opacity-80 z-20 pointer-events-none"
                style={{ 
                  left: `${getCurrentPlayheadX()}px`,
                  top: '24px',
                  height: `${totalHeight}px`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundBox;