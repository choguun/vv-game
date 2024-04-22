type WorkerMessage = {
    interval?: number;
    signal: "start" | "stop";
};
declare let intervalId: number | null;
declare function clearExistingInterval(): void;
//# sourceMappingURL=interval-worker.d.ts.map