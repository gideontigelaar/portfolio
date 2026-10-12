declare global {
  interface Window {
    hireGideon: () => string;
    winGame: () => string;
    setYear: (year: number) => string;
  }
}

export {};