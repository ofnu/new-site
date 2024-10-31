import React from 'react';
import { useEffect } from 'react';
import 'asciinema-player/dist/bundle/asciinema-player.css';

interface Props {
  onComplete: () => void;
}

export default function Player({ onComplete }: Props) {
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    // @ts-ignore - AsciinemaPlayer is loaded globally
    const player = AsciinemaPlayer.create(
      '/assets/knockknock.cast',
      document.getElementById('demo'),
      {
        autoPlay: true,
        cols: isMobile ? 80 : 176,
        rows: isMobile ? 40 : 45,
        fit: 'width',
        controls: false,
        markers: false
      }
    );

    player.addEventListener('ended', onComplete);

    return () => {
      player?.dispose();
    };
  }, []);

  return <div id="demo" />;  // This is now properly typed because of React import
}