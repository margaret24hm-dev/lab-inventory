import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const authSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6位'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export const LoginPage = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values: AuthFormValues) => {
        setLoading(true);
        setError(null);

        const result = isLogin
            ? await signIn(values.email, values.password)
            : await signUp(values.email, values.password);

        if (result.error) {
            setError(result.error.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">LabFreezer</h1>
                        <p className="text-slate-500 mt-2">
                            {isLogin ? '登录你的账户' : '创建新账户'}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>邮箱</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your@email.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>密码</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="至少6位"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                disabled={loading}
                            >
                                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? '没有账户？' : '已有账户？'}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {isLogin ? '注册' : '登录'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
