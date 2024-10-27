type F = string[];
type IncExc = {
    excludes: F;
    includes: F;
};
export declare const isExcluded: (path: string, { excludes, includes }: IncExc) => boolean;
export {};
