import { useEffect, useRef, useState } from 'react';
import { Search, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSampleSearch } from '@/hooks/useSampleSearch';
import { useLabStore } from '@/store/labStore';

export const Header = () => {
    const { query, setQuery, results } = useSampleSearch();
    const { setCurrentBox, samples, boxes } = useLabStore();
    const [isFocused, setIsFocused] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleJump = (sampleId: string) => {
        const sample = samples[sampleId];
        if (sample) {
            setCurrentBox(sample.boxId);
            setQuery('');
        }
    };

    const exportToJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            boxes: boxes,
            samples: samples,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab-inventory-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const exportToCSV = () => {
        const activeSamples = Object.values(samples).filter(s => s.status === 'active');
        
        const headers = [
            '样品编号',
            '样品名称',
            '粒径',
            '表面修饰',
            '溶剂环境',
            '理论浓度',
            '实际浓度',
            '所属容器',
            '位置',
            '备注',
            '创建时间',
        ];

        const rows = activeSamples.map(sample => {
            const box = boxes[sample.boxId];
            return [
                sample.sampleNumber || '',
                sample.name,
                sample.size || '',
                sample.coating,
                sample.solvent,
                sample.molarConc || '',
                sample.massConc || '',
                box?.name || '',
                sample.position + 1,
                sample.notes || '',
                new Date(sample.createdAt).toLocaleString(),
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab-inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    return (
        <div className="h-16 border-b bg-white flex items-center px-6 justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="font-semibold text-slate-700">LabManager</span>
                <span>/</span>
                <span>Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-96 group">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            ref={inputRef}
                            placeholder="Search samples (Cmd + K)..."
                            className="pl-9 bg-slate-50 border-transparent focus:bg-white transition-all ring-offset-0 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        />
                        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
                            <span className="text-xs">Cmd</span>K
                        </kbd>
                    </div>

                    {isFocused && query && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                            {results.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-400">无匹配结果</div>
                            ) : (
                                results.map(sample => (
                                    <div
                                        key={sample.id}
                                        onClick={() => handleJump(sample.id)}
                                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group/item"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-700 group-hover/item:text-indigo-700">{sample.name}</div>
                                            <div className="text-xs text-slate-400">
                                                Pos: {sample.position + 1} - {sample.coating}
                                            </div>
                                        </div>
                                        <div className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">
                                            Jump
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="relative" ref={exportMenuRef}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="gap-2"
                    >
                        <Download size={16} />
                        导出
                    </Button>

                    {showExportMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50 w-48">
                            <button
                                onClick={exportToJSON}
                                className="w-full px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 flex items-center gap-3 text-left"
                            >
                                <FileJson size={16} className="text-indigo-500" />
                                <div>
                                    <div className="text-sm font-medium text-slate-700">导出 JSON</div>
                                    <div className="text-xs text-slate-400">完整数据，可导入恢复</div>
                                </div>
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="w-full px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-left"
                            >
                                <FileSpreadsheet size={16} className="text-green-500" />
                                <div>
                                    <div className="text-sm font-medium text-slate-700">导出 CSV</div>
                                    <div className="text-xs text-slate-400">Excel 可打开</div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
