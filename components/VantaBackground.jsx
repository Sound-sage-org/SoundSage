// VantaBackground.jsx
import { useEffect, useRef, useState } from "react";
// @ts-ignore
import p5 from "p5"; // force TypeScript to accept it

import TRUNK from "vanta/dist/vanta.trunk.min";

export default function VantaBackground() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        TRUNK({
        el: vantaRef.current,
        p5,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xe8a4a4,
        backgroundColor: 0x5c5f63,
        spacing: 3.00,
        chaos: 1.50
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="w-screen h-screen fixed top-0 left-0 -z-10"
    ></div>
  );
}
