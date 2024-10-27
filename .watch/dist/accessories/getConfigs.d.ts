type CopycatConfigs = {
    readonly: boolean;
    copyfrom: string;
    copyto: string;
    excludes?: string[];
    includes?: string[];
}[];
export declare const getConfigs: () => Promise<void | CopycatConfigs>;
export {};
