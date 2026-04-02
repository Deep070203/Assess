"use client";

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FileCode } from 'lucide-react';

// A simple parser for unified diffs
function parseDiff(diffText: string) {
    const lines = diffText.split('\n');
    const files: any[] = [];
    let currentFile: any = null;
    let currentHunk: any = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('diff --git')) {
            if (currentFile) files.push(currentFile);
            const parts = line.split(' ');
            const oldName = parts[parts.length - 2]?.replace(/^a\//, '') || "unknown";
            const newName = parts[parts.length - 1]?.replace(/^b\//, '') || "unknown";
            currentFile = { oldName, newName, hunks: [] };
            currentHunk = null;
        } else if (line.startsWith('@@ ')) {
            // @@ -oldStart,oldCount +newStart,newCount @@
            const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (match && currentFile) {
                currentHunk = {
                    header: line,
                    oldStart: parseInt(match[1], 10),
                    newStart: parseInt(match[2], 10),
                    changes: []
                };
                currentFile.hunks.push(currentHunk);
            }
        } else if (currentHunk) {
            if (line.startsWith('\\ No newline at end of file')) continue;
            currentHunk.changes.push(line);
        }
    }
    if (currentFile) files.push(currentFile);
    return files;
}

export function DiffViewer({ diffString, viewMode }: { diffString: string, viewMode: 'inline' | 'split' }) {
    const files = useMemo(() => parseDiff(diffString), [diffString]);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    const toggle = (i: number) => setCollapsed(p => ({ ...p, [i]: !p[i] }));

    if (!files.length) {
        return (
            <div className="p-8 text-center border border-emerald-200 border-dashed rounded-xl bg-white/50">
                <p className="text-emerald-700 font-medium">Failed to parse diff or diff is empty.</p>
                <div className="mt-4 font-mono text-xs text-left p-4 bg-emerald-50 overflow-x-auto whitespace-pre rounded overflow-y-auto max-h-64 opacity-80 text-emerald-900 border border-emerald-100">
                    {diffString || "No diff content"}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {files.map((file, fileIdx) => {
                const isCollapsed = collapsed[fileIdx] || false;

                return (
                    <div key={fileIdx} className="border border-emerald-100/80 rounded-xl overflow-hidden bg-white shadow-xl shadow-orange-900/5 transition-all">
                        <div
                            onClick={() => toggle(fileIdx)}
                            className="bg-gradient-to-r from-emerald-50 to-orange-50/30 px-4 py-3 border-b border-emerald-100/50 text-[13px] font-mono text-emerald-900 flex items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isCollapsed ? <ChevronRight className="w-4 h-4 text-orange-500" /> : <ChevronDown className="w-4 h-4 text-orange-500" />}
                                <FileCode className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold">{file.newName === file.oldName ? file.newName : `${file.oldName} -> ${file.newName}`}</span>
                            </div>
                            <div className="text-xs text-emerald-600/70">{file.hunks.length} hunks</div>
                        </div>

                        {!isCollapsed && (
                            <div className="w-full overflow-x-auto text-[12px] md:text-[13px] font-mono leading-relaxed">
                                {file.hunks.map((hunk: any, hunkIdx: number) => {
                                    let oldLineNum = hunk.oldStart;
                                    let newLineNum = hunk.newStart;

                                    return (
                                        <div key={hunkIdx} className="border-b border-emerald-50 last:border-0 pb-1">
                                            <div className="bg-orange-50 text-orange-700 px-4 py-1.5 select-none border-b border-orange-100 font-bold opacity-90">
                                                {hunk.header}
                                            </div>

                                            {viewMode === 'inline' ? (
                                                <div className="flex flex-col w-full min-w-max">
                                                    {hunk.changes.map((change: string, idx: number) => {
                                                        const type = change.startsWith('+') ? 'add' : change.startsWith('-') ? 'del' : 'context';
                                                        let oNum = type === 'add' ? '' : oldLineNum++;
                                                        let nNum = type === 'del' ? '' : newLineNum++;

                                                        return (
                                                            <div key={idx} className={`flex w-full hover:bg-emerald-50/50 ${type === 'add' ? 'bg-emerald-100/40 text-emerald-900' : type === 'del' ? 'bg-red-50 text-red-900' : 'text-slate-700'}`}>
                                                                <div className="w-12 flex-shrink-0 text-right pr-3 text-emerald-black/40 select-none border-r border-emerald-100/50 pt-[1px]">{oNum}</div>
                                                                <div className="w-12 flex-shrink-0 text-right pr-3 text-emerald-black/40 select-none border-r border-emerald-100/50 bg-emerald-50/30 pt-[1px]">{nNum}</div>
                                                                <div className="pl-4 whitespace-pre pr-8 py-[1px] font-medium">{change}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <table className="w-full min-w-max border-collapse">
                                                    <tbody>
                                                        {(() => {
                                                            const rows: React.ReactNode[] = [];
                                                            let i = 0;
                                                            while (i < hunk.changes.length) {
                                                                const change = hunk.changes[i];
                                                                if (change.startsWith(' ') || !change) {
                                                                    rows.push(
                                                                        <tr key={i} className="hover:bg-emerald-50/50 text-slate-700">
                                                                            <td className="w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70">{oldLineNum++}</td>
                                                                            <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-emerald-100/50 font-medium">{change.substring(1)}</td>
                                                                            <td className="w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70">{newLineNum++}</td>
                                                                            <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] font-medium">{change.substring(1)}</td>
                                                                        </tr>
                                                                    );
                                                                    i++;
                                                                } else if (change.startsWith('-')) {
                                                                    let delBatch = [];
                                                                    while (i < hunk.changes.length && hunk.changes[i].startsWith('-')) {
                                                                        delBatch.push(hunk.changes[i]);
                                                                        i++;
                                                                    }
                                                                    let addBatch = [];
                                                                    while (i < hunk.changes.length && hunk.changes[i].startsWith('+')) {
                                                                        addBatch.push(hunk.changes[i]);
                                                                        i++;
                                                                    }

                                                                    const maxRows = Math.max(delBatch.length, addBatch.length);
                                                                    for (let r = 0; r < maxRows; r++) {
                                                                        const delChange = delBatch[r];
                                                                        const addChange = addBatch[r];
                                                                        rows.push(
                                                                            <tr key={`${i}-${r}`} className="hover:bg-emerald-50/50">
                                                                                <td className={`w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70 ${delChange ? 'bg-red-50' : ''}`}>
                                                                                    {delChange ? oldLineNum++ : ''}
                                                                                </td>
                                                                                <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-emerald-100/50 ${delChange ? 'bg-red-50 text-red-900 font-medium' : ''}`}>
                                                                                    {delChange ? delChange.substring(1) : ''}
                                                                                </td>
                                                                                <td className={`w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70 ${addChange ? 'bg-emerald-50' : ''}`}>
                                                                                    {addChange ? newLineNum++ : ''}
                                                                                </td>
                                                                                <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] ${addChange ? 'bg-emerald-100/40 text-emerald-900 font-medium' : ''}`}>
                                                                                    {addChange ? addChange.substring(1) : ''}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    }
                                                                } else if (change.startsWith('+')) {
                                                                    rows.push(
                                                                        <tr key={i} className="hover:bg-emerald-50/50">
                                                                            <td className="w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70"></td>
                                                                            <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-emerald-100/50"></td>
                                                                            <td className="w-12 align-top text-right pr-3 pt-[1px] text-emerald-black/40 select-none border-r border-emerald-100/50 opacity-70 bg-emerald-50">{newLineNum++}</td>
                                                                            <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] bg-emerald-100/40 text-emerald-900 font-medium`}>
                                                                                {change.substring(1)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                    i++;
                                                                }
                                                            }
                                                            return rows;
                                                        })()}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
