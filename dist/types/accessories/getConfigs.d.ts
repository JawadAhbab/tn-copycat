type CopycatConfigs = {
    copyfrom: string;
    copyto: string;
    excludes: string[];
}[];
export declare const getConfigs: () => Promise<void | CopycatConfigs>;
export {};
