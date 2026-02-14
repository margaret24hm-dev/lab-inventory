import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BoxGrid } from '@/components/freezer/BoxGrid';
import { SampleDialog } from '@/components/freezer/SampleDialog';
import { useLabStore } from '@/store/labStore';
import { useAuth } from '@/context/AuthContext';
import { TrashList } from '@/components/freezer/TrashList';
import { LoginPage } from '@/components/auth/LoginPage';
import { Inbox, Loader2 } from 'lucide-react';

function Dashboard() {
    const { currentBoxId, boxes, loading } = useLabStore();

    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        boxId: string;
        position: number;
        sampleId?: string;
    }>({ isOpen: false, boxId: '', position: 0 });

    const handleCellClick = (position: number, sampleId?: string) => {
        if (!currentBoxId) return;
        setDialogState({
            isOpen: true,
            boxId: currentBoxId,
            position,
            sampleId,
        });
    };

    const currentBox = currentBoxId && currentBoxId !== 'TRASH' ? boxes[currentBoxId] : null;
    const isTrashView = currentBoxId === 'TRASH';

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-auto p-8 flex flex-col items-center bg-slate-50">

                    {isTrashView ? (
                        <TrashList />
                    ) : currentBox ? (
                        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 flex items-baseline justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{currentBox.name}</h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {currentBox.layout} Layout - {currentBox.description || '无描述'}
                                    </p>
                                </div>
                                <div className="text-sm text-slate-400">
                                    按住拖拽移动 - 点击编辑
                                </div>
                            </div>

                            <BoxGrid
                                boxId={currentBoxId!}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                <Inbox size={48} className="text-indigo-200" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600">未选择容器</h3>
                            <p className="max-w-sm text-center mt-2">
                                请在左侧侧边栏选择一个冷冻盒，或者创建一个新容器来开始管理您的样本。
                            </p>
                        </div>
                    )}
                </main>
            </div>

            <SampleDialog
                isOpen={dialogState.isOpen}
                onOpenChange={(open) => setDialogState(prev => ({ ...prev, isOpen: open }))}
                boxId={dialogState.boxId}
                position={dialogState.position}
                existingSampleId={dialogState.sampleId}
            />
        </div>
    );
}

export default function App() {
    const { user, loading } = useAuth();
    const { fetchData } = useLabStore();

    useEffect(() => {
        if (user) {
            fetchData(user.id);
        }
    }, [user, fetchData]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <Dashboard />;
}
