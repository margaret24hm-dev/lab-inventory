export type SampleStatus = 'active' | 'archived' | 'deleted';

export const COATING_OPTIONS = ['油酸 (OA)', '其他'] as const;
export const SOLVENT_OPTIONS = ['环己烷', '甲醇', '水', '甲苯', 'DMSO', '其他'] as const;

export interface Sample {
    id: string;
    boxId: string;
    position: number;

    sampleNumber: string;
    name: string;

    size?: string;
    coating: string;
    solvent: string;
    molarConc?: number;
    massConc?: number;

    createdAt: number;
    notes?: string;
    status: SampleStatus;
}

export interface Box {
    id: string;
    name: string;
    description?: string;
    layout: '10x10' | '9x9';
}
