import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { SampleForm } from './SampleForm';

interface SampleDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    boxId: string;
    position: number;
    existingSampleId?: string;
}

export const SampleDialog: React.FC<SampleDialogProps> = ({
    isOpen,
    onOpenChange,
    boxId,
    position,
    existingSampleId,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-slate-200 text-black">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        {existingSampleId ? '编辑样本' : '样本入库'}
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            POS: {position + 1}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {existingSampleId
                            ? '修改样本的元数据或化学属性。'
                            : '录入新样本信息，样品编号和名称为必填项。'}
                    </DialogDescription>
                </DialogHeader>

                <SampleForm
                    boxId={boxId}
                    position={position}
                    existingSampleId={existingSampleId}
                    onClose={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
