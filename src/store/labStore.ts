import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { Box, Sample, SampleStatus } from '@/types/schema';

interface LabState {
    boxes: Record<string, Box>;
    samples: Record<string, Sample>;
    currentBoxId: string | null;
    loading: boolean;
    error: string | null;
}

interface LabActions {
    fetchData: (userId: string) => Promise<void>;
    initBox: (name: string, userId: string) => Promise<void>;
    setCurrentBox: (boxId: string | null) => void;
    deleteBox: (boxId: string) => Promise<void>;
    addSample: (sample: Omit<Sample, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateSample: (id: string, updates: Partial<Sample>) => Promise<void>;
    archiveSample: (id: string) => Promise<void>;
    moveSample: (sampleId: string, targetBoxId: string, targetPos: number) => Promise<void>;
    copySample: (sampleId: string) => Promise<void>;
    clearError: () => void;
}

interface BoxRow {
    id: string;
    name: string;
    description?: string;
    layout: '10x10' | '9x9';
    user_id: string;
    created_at: string;
}

interface SampleRow {
    id: string;
    box_id: string;
    position: number;
    sample_number: string;
    name: string;
    size?: string;
    coating: string;
    solvent: string;
    molar_conc?: number;
    mass_conc?: number;
    notes?: string;
    status: SampleStatus;
    user_id: string;
    created_at: string;
}

const mapBoxRow = (row: BoxRow): Box => ({
    id: row.id,
    name: row.name,
    description: row.description,
    layout: row.layout,
});

const mapSampleRow = (row: SampleRow): Sample => ({
    id: row.id,
    boxId: row.box_id,
    position: row.position,
    sampleNumber: row.sample_number,
    name: row.name,
    size: row.size,
    coating: row.coating,
    solvent: row.solvent,
    molarConc: row.molar_conc,
    massConc: row.mass_conc,
    notes: row.notes,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
});

export const useLabStore = create<LabState & LabActions>()((set, get) => ({
    boxes: {},
    samples: {},
    currentBoxId: null,
    loading: false,
    error: null,

    fetchData: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const [boxesRes, samplesRes] = await Promise.all([
                supabase.from('boxes').select('*').eq('user_id', userId),
                supabase.from('samples').select('*').eq('user_id', userId),
            ]);

            if (boxesRes.error) throw boxesRes.error;
            if (samplesRes.error) throw samplesRes.error;

            const boxes: Record<string, Box> = {};
            (boxesRes.data as BoxRow[]).forEach((row) => {
                boxes[row.id] = mapBoxRow(row);
            });

            const samples: Record<string, Sample> = {};
            (samplesRes.data as SampleRow[]).forEach((row) => {
                samples[row.id] = mapSampleRow(row);
            });

            set({
                boxes,
                samples,
                currentBoxId: Object.keys(boxes)[0] || null,
                loading: false,
            });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    initBox: async (name: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('boxes')
                .insert({ name, user_id: userId, layout: '10x10' })
                .select()
                .single();

            if (error) throw error;

            const box = mapBoxRow(data as BoxRow);
            set((state) => ({
                boxes: { ...state.boxes, [box.id]: box },
                currentBoxId: state.currentBoxId || box.id,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    setCurrentBox: (boxId) => {
        set({ currentBoxId: boxId });
    },

    deleteBox: async (boxId: string) => {
        try {
            const { error } = await supabase.from('boxes').delete().eq('id', boxId);
            if (error) throw error;

            set((state) => {
                const newBoxes = { ...state.boxes };
                delete newBoxes[boxId];
                const newSamples = { ...state.samples };
                Object.values(newSamples).forEach((s) => {
                    if (s.boxId === boxId) s.status = 'deleted';
                });
                return {
                    boxes: newBoxes,
                    samples: newSamples,
                    currentBoxId: state.currentBoxId === boxId ? null : state.currentBoxId,
                };
            });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    addSample: async (sampleData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('samples')
                .insert({
                    box_id: sampleData.boxId,
                    position: sampleData.position,
                    sample_number: sampleData.sampleNumber,
                    name: sampleData.name,
                    size: sampleData.size,
                    coating: sampleData.coating,
                    solvent: sampleData.solvent,
                    molar_conc: sampleData.molarConc,
                    mass_conc: sampleData.massConc,
                    notes: sampleData.notes,
                    user_id: user.id,
                    status: 'active',
                })
                .select()
                .single();

            if (error) throw error;

            const sample = mapSampleRow(data as SampleRow);
            set((state) => ({
                samples: { ...state.samples, [sample.id]: sample },
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateSample: async (id: string, updates: Partial<Sample>) => {
        try {
            const dbUpdates: Record<string, unknown> = {};
            if (updates.sampleNumber !== undefined) dbUpdates.sample_number = updates.sampleNumber;
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.size !== undefined) dbUpdates.size = updates.size;
            if (updates.coating !== undefined) dbUpdates.coating = updates.coating;
            if (updates.solvent !== undefined) dbUpdates.solvent = updates.solvent;
            if (updates.molarConc !== undefined) dbUpdates.molar_conc = updates.molarConc;
            if (updates.massConc !== undefined) dbUpdates.mass_conc = updates.massConc;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
            if (updates.boxId !== undefined) dbUpdates.box_id = updates.boxId;
            if (updates.position !== undefined) dbUpdates.position = updates.position;
            if (updates.status !== undefined) dbUpdates.status = updates.status;

            const { error } = await supabase.from('samples').update(dbUpdates).eq('id', id);
            if (error) throw error;

            set((state) => {
                if (state.samples[id]) {
                    return {
                        samples: {
                            ...state.samples,
                            [id]: { ...state.samples[id], ...updates },
                        },
                    };
                }
                return state;
            });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    archiveSample: async (id: string) => {
        try {
            const { error } = await supabase
                .from('samples')
                .update({ status: 'archived', box_id: null, position: -1 })
                .eq('id', id);
            if (error) throw error;

            set((state) => {
                if (state.samples[id]) {
                    return {
                        samples: {
                            ...state.samples,
                            [id]: {
                                ...state.samples[id],
                                status: 'archived',
                                boxId: '',
                                position: -1,
                            },
                        },
                    };
                }
                return state;
            });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    moveSample: async (sourceSampleId: string, targetBoxId: string, targetPos: number) => {
        const { samples } = get();
        const sourceSample = samples[sourceSampleId];
        if (!sourceSample) return;

        const targetOccupant = Object.values(samples).find(
            (s) => s.boxId === targetBoxId && s.position === targetPos && s.status === 'active' && s.id !== sourceSampleId
        );

        try {
            if (targetOccupant) {
                await Promise.all([
                    supabase
                        .from('samples')
                        .update({ box_id: sourceSample.boxId, position: sourceSample.position })
                        .eq('id', targetOccupant.id),
                    supabase
                        .from('samples')
                        .update({ box_id: targetBoxId, position: targetPos })
                        .eq('id', sourceSampleId),
                ]);

                set((state) => ({
                    samples: {
                        ...state.samples,
                        [targetOccupant.id]: {
                            ...state.samples[targetOccupant.id],
                            boxId: sourceSample.boxId,
                            position: sourceSample.position,
                        },
                        [sourceSampleId]: {
                            ...state.samples[sourceSampleId],
                            boxId: targetBoxId,
                            position: targetPos,
                        },
                    },
                }));
            } else {
                const { error } = await supabase
                    .from('samples')
                    .update({ box_id: targetBoxId, position: targetPos })
                    .eq('id', sourceSampleId);
                if (error) throw error;

                set((state) => ({
                    samples: {
                        ...state.samples,
                        [sourceSampleId]: {
                            ...state.samples[sourceSampleId],
                            boxId: targetBoxId,
                            position: targetPos,
                        },
                    },
                }));
            }
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    copySample: async (sampleId: string) => {
        const { samples } = get();
        const sourceSample = samples[sampleId];
        if (!sourceSample) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const boxSamples = Object.values(samples).filter(
            s => s.boxId === sourceSample.boxId && s.status === 'active'
        );
        const occupiedPositions = new Set(boxSamples.map(s => s.position));

        let newPosition = -1;
        for (let i = 0; i < 100; i++) {
            if (!occupiedPositions.has(i)) {
                newPosition = i;
                break;
            }
        }

        if (newPosition === -1) {
            set({ error: '容器已满，无法复制' });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('samples')
                .insert({
                    box_id: sourceSample.boxId,
                    position: newPosition,
                    sample_number: sourceSample.sampleNumber,
                    name: sourceSample.name,
                    size: sourceSample.size,
                    coating: sourceSample.coating,
                    solvent: sourceSample.solvent,
                    molar_conc: sourceSample.molarConc,
                    mass_conc: sourceSample.massConc,
                    notes: sourceSample.notes,
                    user_id: user.id,
                    status: 'active',
                })
                .select()
                .single();

            if (error) throw error;

            const newSample = mapSampleRow(data as SampleRow);
            set((state) => ({
                samples: { ...state.samples, [newSample.id]: newSample },
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    clearError: () => set({ error: null }),
}));
