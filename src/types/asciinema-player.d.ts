declare module 'asciinema-player' {
    const AsciinemaPlayer: {
      create: (src: string, element: HTMLElement, options?: Record<string, unknown>) => any;
    };
    export default AsciinemaPlayer;
  }
  