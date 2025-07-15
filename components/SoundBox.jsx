import { useEffect, useRef, useState } from "react";

const pitchNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SoundBox = ({ LIGHTARR, sampler }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const played = useRef(new Set());

  const [startTime, setStartTime] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const pixelsPerSecond = 60;
  const keyHeight = 20;
  const timelinePadding = 2; // seconds of empty space before notes start

  const midiPitches = [];
  for (let i = 21; i <= 108; i++) {
    const octave = Math.floor(i / 12) - 1;
    const note = pitchNames[i % 12];
    midiPitches.push({ name: `${note}${octave}`, number: i });
  }

  const totalDuration = Math.max(...LIGHTARR.map(n => n.time + n.duration / 1000)) + timelinePadding;
  const contentWidth = totalDuration * pixelsPerSecond + 200;

  const playNote = (note) => {
    if (sampler) {
      sampler.triggerAttackRelease(note.name, "8n", undefined, note.velocity || 0.8);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    setStartTime(performance.now());
    played.current.clear();
  }, [LIGHTARR]);

  useEffect(() => {
    if (!startTime) return;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const playheadX = (elapsed / 1000) * pixelsPerSecond;

      const fixedPlayheadX = containerWidth * 0.7;
      if (playheadX > fixedPlayheadX && scrollRef.current) {
        scrollRef.current.scrollLeft = playheadX - fixedPlayheadX;
      }

      for (const note of LIGHTARR) {
        const startX = (note.time + timelinePadding) * pixelsPerSecond;
        const endX = startX + (note.duration * pixelsPerSecond) / 1000;

        if (
          playheadX >= startX &&
          playheadX <= endX &&
          !played.current.has(note)
        ) {
          played.current.add(note);
          playNote(note);
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [startTime, containerWidth]);

  return (
    <div ref={containerRef} className="relative h-[1760px] border rounded-xl bg-white overflow-hidden">
      {/* Playhead fixed visually at 70% */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-blue-600 z-50 pointer-events-none"
        style={{ left: `${containerWidth * 0.7}px` }}
      />

      <div
        ref={scrollRef}
        className="w-full h-full overflow-x-scroll overflow-y-hidden"
      >
        <div
          className="relative"
          style={{
            width: `${contentWidth}px`,
            height: `${88 * keyHeight}px`,
          }}
        >
          {/* True time=0 indicator (vertical bar) */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-gray-400" style={{ left: 0 }} />

          {midiPitches.map((pitch, idx) => {
            const y = idx * keyHeight;
            const rowNotes = LIGHTARR.filter(n => n.name === pitch.name);

            return (
              <div
                key={pitch.name}
                className="absolute w-full border-b border-gray-200 flex items-center"
                style={{ top: y, height: keyHeight }}
              >
                <div className="w-24 pl-2 text-sm text-gray-600 font-mono">{pitch.name}</div>

                {rowNotes.map((note, i) => {
                  const left = (note.time + timelinePadding) * pixelsPerSecond;
                  const width = (note.duration * pixelsPerSecond) / 1000;

                  return (
                    <div
                      key={i}
                      className="absolute h-4 bg-red-400 rounded-sm top-1/2 -translate-y-1/2"
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SoundBox;
