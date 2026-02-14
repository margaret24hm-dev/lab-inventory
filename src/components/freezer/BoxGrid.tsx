import React, { useMemo } from 'react';
import {
    DndContext,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { useLabStore } from '@/store/labStore';
import { GridCell } from './GridCell';

interface BoxGridProps {
    boxId: string;
    onCellClick: (position: number, sampleId?: string) => void;
}

export const BoxGrid: React.FC<BoxGridProps> = ({ boxId, onCellClick }) => {
    const { samples, moveSample } = useLabStore();

    // 1. 性能优化：根据 boxId 筛选样品 (Memoize)
    // 虽然 Zustand 很快，但预处理数据是好习惯
    const boxSamples = useMemo(() => {
        const map = new Map<number, typeof samples[string]>();
        Object.values(samples).forEach(sample => {
            if (sample.boxId === boxId && sample.status === 'active') {
                map.set(sample.position, sample);
            }
        });
        return map;
    }, [samples, boxId]);

    // 2. 配置 DnD 传感器
    // PointerSensor 兼容鼠标和触摸，activationConstraint 防止点击误触拖拽
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 移动 8px 后才视为拖拽，防止点击触发
            },
        })
    );

    // 3. 处理拖拽结束
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // 如果没有拖到任何 Droppable 区域，直接返回
        if (!over) return;

        // 获取源 ID (样品 ID)
        const sampleId = active.id as string;

        // 解析目标位置
        // 我们在 GridCell 的 useDroppable data 中存了结构化数据，比解析 string ID 更安全
        const targetData = over.data.current;

        if (targetData && typeof targetData.position === 'number') {
            const targetBoxId = targetData.boxId; // 允许跨盒子拖拽（如果有视图支持）
            const targetPos = targetData.position;

            // 触发 Store Action
            moveSample(sampleId, targetBoxId, targetPos);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
        // 可以在这里添加 onDragStart 做震动反馈等
        >
            <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm">
                {/* 10x10 Grid 布局 */}
                <div className="grid grid-cols-10 gap-2 w-full max-w-3xl mx-auto aspect-square">
                    {Array.from({ length: 100 }).map((_, index) => {
                        const sample = boxSamples.get(index);
                        return (
                            <GridCell
                                key={`${boxId}-${index}`}
                                boxId={boxId}
                                position={index}
                                sample={sample}
                                onClick={() => onCellClick(index, sample?.id)}
                            />
                        );
                    })}
                </div>
            </div>
        </DndContext>
    );
};
