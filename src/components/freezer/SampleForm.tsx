import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLabStore } from '@/store/labStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COATING_OPTIONS, SOLVENT_OPTIONS } from '@/types/schema';

const formSchema = z.object({
    sampleNumber: z.string().min(1, "样品编号必填"),
    name: z.string().min(1, "样品名称必填"),
    size: z.string().optional(),
    coating: z.string().default("油酸 (OA)"),
    solvent: z.string().default("环己烷"),
    molarConc: z.string().optional(),
    massConc: z.string().optional(),
    notes: z.string().optional(),
});

interface SampleFormProps {
    boxId: string;
    position: number;
    existingSampleId?: string;
    onClose: () => void;
}

export const SampleForm: React.FC<SampleFormProps> = ({ boxId, position, existingSampleId, onClose }) => {
    const { addSample, updateSample, samples } = useLabStore();

    const existingSample = existingSampleId ? samples[existingSampleId] : null;

    const [customCoating, setCustomCoating] = useState('');
    const [customSolvent, setCustomSolvent] = useState('');
    const [showCustomCoating, setShowCustomCoating] = useState(false);
    const [showCustomSolvent, setShowCustomSolvent] = useState(false);

    const defaultValues = existingSample ? {
        sampleNumber: existingSample.sampleNumber || '',
        name: existingSample.name,
        size: existingSample.size || '',
        coating: existingSample.coating,
        solvent: existingSample.solvent,
        molarConc: existingSample.molarConc?.toString() || '',
        massConc: existingSample.massConc?.toString() || '',
        notes: existingSample.notes || '',
    } : {
        sampleNumber: '',
        name: '',
        size: '',
        coating: '油酸 (OA)',
        solvent: '环己烷',
        molarConc: '',
        massConc: '',
        notes: '',
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        if (existingSample) {
            const coatingInOptions = (COATING_OPTIONS as readonly string[]).includes(existingSample.coating);
            const solventInOptions = (SOLVENT_OPTIONS as readonly string[]).includes(existingSample.solvent);
            
            if (!coatingInOptions && existingSample.coating) {
                setShowCustomCoating(true);
                setCustomCoating(existingSample.coating);
                form.setValue('coating', '其他');
            }
            
            if (!solventInOptions && existingSample.solvent) {
                setShowCustomSolvent(true);
                setCustomSolvent(existingSample.solvent);
                form.setValue('solvent', '其他');
            }
        }
    }, [existingSample]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const finalCoating = showCustomCoating && values.coating === '其他' ? customCoating : values.coating;
        const finalSolvent = showCustomSolvent && values.solvent === '其他' ? customSolvent : values.solvent;

        const sampleData = {
            sampleNumber: values.sampleNumber,
            name: values.name,
            boxId,
            position,
            size: values.size || undefined,
            coating: finalCoating,
            solvent: finalSolvent,
            molarConc: values.molarConc ? Number(values.molarConc) : undefined,
            massConc: values.massConc ? Number(values.massConc) : undefined,
            notes: values.notes || undefined,
        };

        if (existingSampleId) {
            updateSample(existingSampleId, sampleData);
        } else {
            addSample(sampleData);
        }
        onClose();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sampleNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>样品编号 *</FormLabel>
                                <FormControl>
                                    <Input placeholder="唯一标识" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>样品名称 *</FormLabel>
                                <FormControl>
                                    <Input placeholder="如 NaYF4:Yb,Er" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>粒径 (nm)</FormLabel>
                            <FormControl>
                                <Input placeholder="选填，如 20-50" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="coating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>表面修饰</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (value === '其他') {
                                            setShowCustomCoating(true);
                                        } else {
                                            setShowCustomCoating(false);
                                            setCustomCoating('');
                                        }
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择表面修饰" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white">
                                        {COATING_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {showCustomCoating && (
                                    <Input
                                        className="mt-2"
                                        placeholder="请输入具体修饰"
                                        value={customCoating}
                                        onChange={(e) => setCustomCoating(e.target.value)}
                                    />
                                )}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="solvent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>溶剂环境</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (value === '其他') {
                                            setShowCustomSolvent(true);
                                        } else {
                                            setShowCustomSolvent(false);
                                            setCustomSolvent('');
                                        }
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择溶剂" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white">
                                        {SOLVENT_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {showCustomSolvent && (
                                    <Input
                                        className="mt-2"
                                        placeholder="请输入具体溶剂"
                                        value={customSolvent}
                                        onChange={(e) => setCustomSolvent(e.target.value)}
                                    />
                                )}
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="molarConc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>理论浓度 (M)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="mol/L" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="massConc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>实际浓度 (mg/mL)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="mg/mL" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>详细备注</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="制备方法、前体材料编号、电镜文件拍摄日期或路径..."
                                    className="min-h-[80px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-between pt-2 gap-2">
                    {existingSampleId && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    useLabStore.getState().copySample(existingSampleId);
                                    onClose();
                                }}
                            >
                                复制样品
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    if (confirm('确定要归档此样品吗？它将移入垃圾盒。')) {
                                        useLabStore.getState().archiveSample(existingSampleId);
                                        onClose();
                                    }
                                }}
                            >
                                标记空瓶/归档
                            </Button>
                        </div>
                    )}
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 ml-auto">
                        {existingSampleId ? '保存修改' : '确认入库'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
