import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Sample } from '@/types/schema';

const getCoatingColor = (coating: string) => {
    if (coating.includes('油酸') || coating.toLowerCase().includes('oa')) {
        return 'rgb(253, 224, 71)';
    }
    return 'rgb(147, 197, 253)';
};

interface DraggableSampleProps {
    sample: Sample;
}

const DraggableSample: React.FC<DraggableSampleProps> = ({ sample }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: sample.id,
        data: { sample },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        backgroundColor: getCoatingColor(sample.coating),
        color: '#334155',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "h-full w-full rounded-md flex items-center justify-center p-1 cursor-grab shadow-sm transition-shadow",
                "border border-slate-200/50 hover:shadow-md active:cursor-grabbing",
                isDragging ? "opacity-50 z-50 shadow-xl scale-105" : "z-10"
            )}
        >
            <span className="text-sm font-semibold w-full text-center leading-tight line-clamp-2 break-all">
                {sample.name}
            </span>
        </div>
    );
};

interface GridCellProps {
    boxId: string;
    position: number;
    sample?: Sample;
    onClick?: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({ boxId, position, sample, onClick }) => {
    const cellId = `${boxId}-${position}`;

    const { isOver, setNodeRef } = useDroppable({
        id: cellId,
        data: { boxId, position },
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                "relative aspect-square border border-slate-200 rounded-lg bg-white transition-colors duration-200",
                "flex items-center justify-center cursor-pointer hover:bg-slate-50",
                isOver && !sample && "bg-slate-100 ring-2 ring-indigo-400 ring-inset",
                isOver && sample && "bg-orange-50 ring-2 ring-orange-400 ring-inset"
            )}
        >
            {!sample && (
                <span className="absolute text-slate-300 text-xs font-mono select-none pointer-events-none">
                    {position + 1}
                </span>
            )}

            {sample && (
                <DraggableSample sample={sample} />
            )}
        </div>
    );
};
