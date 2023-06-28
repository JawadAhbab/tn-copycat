type Event = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
export declare const execWatch: (event: Event, frompath: string, topath: string) => void;
export {};
