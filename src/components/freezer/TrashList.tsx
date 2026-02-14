import { useState } from 'react';
import { useLabStore } from '@/store/labStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { SampleDialog } from './SampleDialog';

const TrashList = () => {
    const { samples } = useLabStore();
    const [editingSample, setEditingSample] = useState<string | null>(null);

    const archivedSamples = Object.values(samples).filter(s => s.status === 'archived');

    return (
        <div className="w-full max-w-4xl animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    垃圾盒 / 历史归档
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    这里存放了所有被标记为空瓶或废弃的样品。它们不再占用具体的网格位置，但保留了所有的实验记录。
                </p>
            </div>

            {archivedSamples.length === 0 ? (
                <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    暂无归档样品
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-2">样品编号</div>
                        <div className="col-span-3">样品名称</div>
                        <div className="col-span-2">化学属性</div>
                        <div className="col-span-3">备注</div>
                        <div className="col-span-2 text-right">操作</div>
                    </div>
                    <ScrollArea className="h-[600px]">
                        {archivedSamples.map((sample) => (
                            <div
                                key={sample.id}
                                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center"
                            >
                                <div className="col-span-2">
                                    <div className="font-medium text-slate-900">{sample.sampleNumber || '-'}</div>
                                </div>
                                <div className="col-span-3">
                                    <div className="font-medium text-slate-900">{sample.name}</div>
                                </div>
                                <div className="col-span-2 text-sm text-slate-600">
                                    <div>{sample.coating}</div>
                                    <div className="text-xs text-slate-400">{sample.solvent}</div>
                                </div>
                                <div className="col-span-3 text-sm text-slate-500 italic truncate">
                                    {sample.notes || '-'}
                                </div>
                                <div className="col-span-2 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingSample(sample.id)}
                                        className="text-slate-400 hover:text-indigo-600"
                                    >
                                        <Pencil size={14} className="mr-1" /> 编辑
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            )}

            {editingSample && (
                <SampleDialog
                    isOpen={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingSample(null);
                    }}
                    boxId={samples[editingSample]?.boxId || ''}
                    position={samples[editingSample]?.position || 0}
                    existingSampleId={editingSample}
                />
            )}
        </div>
    );
};

export { TrashList };
