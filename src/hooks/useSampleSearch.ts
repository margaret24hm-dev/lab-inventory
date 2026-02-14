import { useMemo, useState } from 'react';
import { useLabStore } from '@/store/labStore';

export function useSampleSearch() {
    const { samples, boxes } = useLabStore();
    const [query, setQuery] = useState('');

    // 核心搜索算法：Computed State
    const results = useMemo(() => {
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) return [];

        // 1. Tokenization: 将输入按空格拆分为关键词数组
        // e.g., "NaYF4 10nm" -> ["nayf4", "10nm"]
        const tokens = trimmedQuery.split(/\s+/).filter(Boolean);

        return Object.values(samples).filter((sample) => {
            if (sample.status === 'deleted') return false;

            // 2. 构建索引字符串 (包括名称、备注、溶剂)
            // 可以根据需要扩展搜索范围，比如加入 boxName
            const boxName = boxes[sample.boxId]?.name || '';
            const searchableText = `
        ${sample.name} 
        ${sample.notes || ''} 
        ${sample.solvent} 
        ${sample.coating}
        ${boxName}
      `.toLowerCase();

            // 3. AND Logic: 必须包含所有 token
            return tokens.every((token) => searchableText.includes(token));
        });
    }, [query, samples, boxes]);

    return { query, setQuery, results };
}
