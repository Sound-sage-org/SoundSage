import { useEffect, useRef, useState } from "react";

const pitchNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SoundBox = ({ LIGHTARR, sampler }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const played = useRef(new Set());
  const animationRef = useRef(null);

  const [startTime, setStartTime] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const pixelsPerSecond = 100; // Increased for better visibility
  const keyHeight = 20;
  const timelinePadding = 1; // Reduced padding
  const playheadPosition = 0.7; // 70% of screen width

  // Generate MIDI pitches (21-108 covers 88 piano keys)
  const midiPitches = [];
  for (let i = 108; i >= 21; i--) { // Reverse order for proper display (high notes on top)
    const octave = Math.floor(i / 12) - 1;
    const note = pitchNames[i % 12];
    midiPitches.push({ name: `${note}${octave}`, number: i });
  }

  const totalDuration = (LIGHTARR && LIGHTARR.length > 0) 
    ? Math.max(...LIGHTARR.map(n => n.time + n.duration / 1000)) + timelinePadding + 5
    : 10;
  const contentWidth = totalDuration * pixelsPerSecond;

  const playNote = (note) => {
    if (sampler) {
      sampler.triggerAttackRelease(note.name, "8n", undefined, note.velocity || 0.8);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setStartTime(null);
    played.current.clear();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startPlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    
    setIsPlaying(true);
    setStartTime(performance.now());
    played.current.clear();
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    if (!startTime || !isPlaying) return;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000; // Convert to seconds
      const playheadX = elapsed * pixelsPerSecond;

      // Calculate the fixed playhead position on screen
      const fixedPlayheadX = containerWidth * playheadPosition;
      
      // Auto-scroll when playhead would go beyond the fixed position
      if (scrollRef.current) {
        const scrollLeft = Math.max(0, playheadX - fixedPlayheadX);
        scrollRef.current.scrollLeft = scrollLeft;
      }

      // Play notes that should be playing at current time
      if (LIGHTARR && LIGHTARR.length > 0) {
        for (const note of LIGHTARR) {
          const noteStartTime = note.time + timelinePadding;
          const noteEndTime = noteStartTime + (note.duration / 1000);
          
          if (elapsed >= noteStartTime && elapsed <= noteEndTime && !played.current.has(note)) {
            played.current.add(note);
            playNote(note);
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
  }, [startTime, isPlaying, containerWidth, totalDuration, LIGHTARR]);

  // Helper function to determine if a note is black key
  const isBlackKey = (noteName) => {
    return noteName.includes('#');
  };

  // Get current playhead position for visual display
  const getCurrentPlayheadX = () => {
    if (!startTime || !isPlaying) return 0;
    const elapsed = (performance.now() - startTime) / 1000;
    return elapsed * pixelsPerSecond;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Control Panel */}
      <div className="bg-gray-800 text-white p-2 flex items-center gap-4">
        <button 
          onClick={startPlayback}
          className={`px-4 py-2 rounded ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <div className="text-sm">
          Notes: {LIGHTARR ? LIGHTARR.length : 0} | Duration: {totalDuration.toFixed(1)}s
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
          <div className="w-16 bg-gray-800 flex-shrink-0 border-r border-gray-600">
            {midiPitches.map((pitch, idx) => (
              <div
                key={pitch.name}
                className={`flex items-center justify-center text-xs font-mono border-b border-gray-600 ${
                  isBlackKey(pitch.name) 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-200 text-black'
                }`}
                style={{ height: keyHeight }}
              >
                {pitch.name}
              </div>
            ))}
          </div>

          {/* Scrollable Timeline */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div
              className="relative bg-gray-800"
              style={{
                width: `${contentWidth}px`,
                height: `${88 * keyHeight}px`,
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0">
                {/* Vertical grid lines (time markers) */}
                {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-gray-600"
                    style={{ left: `${(i + timelinePadding) * pixelsPerSecond}px` }}
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
                      backgroundColor: isBlackKey(pitch.name) ? 'rgba(55, 65, 81, 0.5)' : 'rgba(75, 85, 99, 0.3)'
                    }}
                  />
                ))}
              </div>

              {/* Notes */}
              {LIGHTARR && LIGHTARR.map((note, noteIdx) => {
                const pitchIndex = midiPitches.findIndex(p => p.name === note.name);
                if (pitchIndex === -1) return null;

                const left = (note.time + timelinePadding) * pixelsPerSecond;
                const width = Math.max(2, (note.duration * pixelsPerSecond) / 1000);
                const top = pitchIndex * keyHeight;

                return (
                  <div
                    key={`${note.name}-${noteIdx}`}
                    className="absolute bg-blue-500 border border-blue-400 rounded-sm cursor-pointer hover:bg-blue-400 transition-colors"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: `${top + 2}px`,
                      height: `${keyHeight - 4}px`,
                    }}
                    title={`${note.name} - ${note.duration}ms`}
                  />
                );
              })}

              {/* Moving Playhead (in timeline) */}
              {isPlaying && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 opacity-30"
                  style={{ left: `${getCurrentPlayheadX() + timelinePadding * pixelsPerSecond}px` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundBox;