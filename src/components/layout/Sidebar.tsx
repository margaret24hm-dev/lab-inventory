import { useState } from 'react';
import { useLabStore } from '@/store/labStore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Plus, Box as BoxIcon, Trash2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export const Sidebar = () => {
    const { boxes, currentBoxId, setCurrentBox, initBox, deleteBox, samples } = useLabStore();
    const { user, signOut } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBoxName, setNewBoxName] = useState('');
    const [collapsed, setCollapsed] = useState(false);

    const handleAddBox = () => {
        setIsDialogOpen(true);
        setNewBoxName('');
    };

    const handleConfirmAddBox = async () => {
        if (newBoxName.trim() && user) {
            await initBox(newBoxName.trim(), user.id);
            setIsDialogOpen(false);
            setNewBoxName('');
        }
    };

    const getBoxStats = (boxId: string) => {
        const count = Object.values(samples).filter(
            s => s.boxId === boxId && s.status === 'active'
        ).length;
        return `${count}/100`;
    };

    return (
        <>
            <div className={cn(
                "border-r border-slate-800 bg-black text-slate-100 flex flex-col h-screen transition-all duration-300 relative",
                collapsed ? "w-16" : "w-56"
            )}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 z-10 bg-white hover:bg-slate-100 rounded-full p-1 shadow-md"
                >
                    {collapsed ? (
                        <ChevronRight size={16} className="text-black fill-black" />
                    ) : (
                        <ChevronLeft size={16} className="text-black fill-black" />
                    )}
                </button>

                <div className="p-6">
                    <h1 className={cn("text-xl font-bold", collapsed && "text-sm font-bold")}>
                        {collapsed ? 'LF' : 'LabFreezer'}
                    </h1>
                    {!collapsed && (
                        <>
                            <p className="text-xs text-slate-400 mt-1 font-bold">v3.0 Cloud Edition</p>
                            <div className="text-xs text-slate-500 mt-2 truncate font-bold">
                                {user?.email}
                            </div>
                        </>
                    )}
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-2">
                        {Object.values(boxes).map((box) => (
                            <div
                                key={box.id}
                                onClick={() => setCurrentBox(box.id)}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                                    currentBoxId === box.id
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "hover:bg-slate-800 text-slate-300",
                                    collapsed && "justify-center"
                                )}
                                title={collapsed ? box.name : undefined}
                            >
                                <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
                                    <BoxIcon size={18} />
                                    {!collapsed && (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{box.name}</span>
                                            <span className="text-[10px] opacity-70 font-bold">{getBoxStats(box.id)}</span>
                                        </div>
                                    )}
                                </div>

                                {!collapsed && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteBox(box.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-2 border-t border-slate-800 space-y-2">
                    <div
                        onClick={() => setCurrentBox('TRASH')}
                        className={cn(
                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                            currentBoxId === 'TRASH'
                                ? "bg-red-900/30 text-red-200 shadow-md border border-red-900/50"
                                : "hover:bg-slate-800 text-slate-400 hover:text-red-300",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? "垃圾盒 / 历史" : undefined}
                    >
                        <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
                            <Trash2 size={18} />
                            {!collapsed && (
                                <span className="text-sm font-bold">垃圾盒 / 历史</span>
                            )}
                        </div>
                    </div>

                    {!collapsed && (
                        <Button
                            onClick={handleAddBox}
                            variant="secondary"
                            className="w-full gap-2 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700 font-bold"
                        >
                            <Plus size={16} /> 新增容器
                        </Button>
                    )}

                    {collapsed && (
                        <Button
                            onClick={handleAddBox}
                            variant="secondary"
                            className="w-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700 p-2"
                            title="新增容器"
                        >
                            <Plus size={16} />
                        </Button>
                    )}

                    {!collapsed && (
                        <Button
                            onClick={signOut}
                            variant="ghost"
                            className="w-full gap-2 text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
                        >
                            <LogOut size={16} /> 退出登录
                        </Button>
                    )}

                    {collapsed && (
                        <Button
                            onClick={signOut}
                            variant="ghost"
                            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 p-2"
                            title="退出登录"
                        >
                            <LogOut size={16} />
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle>新增容器</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="请输入容器名称，如 96孔板-A1"
                            value={newBoxName}
                            onChange={(e) => setNewBoxName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmAddBox();
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleConfirmAddBox}
                            disabled={!newBoxName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
