declare global {
  interface Window {
    hireGideon: () => string;
    winGame: () => string;
    goToSleep: () => string;
    setYear: (year: number) => string;
  }

  interface WindowEventMap {
    'eggs-complete': Event;
  }
}

export {};