"use client";

import React, { useMemo } from 'react';

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

    if (!files.length) {
        return (
            <div className="p-8 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-slate-400 font-medium">Failed to parse diff or diff is empty.</p>
                <div className="mt-4 font-mono text-xs text-left p-4 bg-black/50 overflow-x-auto whitespace-pre rounded overflow-y-auto max-h-64 opacity-50">
                    {diffString || "No diff content"}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {files.map((file, fileIdx) => (
                <div key={fileIdx} className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a] shadow-lg shadow-black/50">
                    <div className="bg-[#15161b] px-4 py-3 border-b border-white/10 text-[13px] font-mono text-slate-200 flex items-center justify-between">
                        <span>{file.newName === file.oldName ? file.newName : `${file.oldName} -> ${file.newName}`}</span>
                    </div>

                    <div className="w-full overflow-x-auto text-[12px] md:text-[13px] font-mono leading-relaxed">
                        {file.hunks.map((hunk: any, hunkIdx: number) => {
                            let oldLineNum = hunk.oldStart;
                            let newLineNum = hunk.newStart;

                            return (
                                <div key={hunkIdx} className="border-b border-white/5 last:border-0 pb-1">
                                    <div className="bg-blue-500/[0.08] text-blue-300/80 px-4 py-1.5 select-none border-b border-blue-500/10">
                                        {hunk.header}
                                    </div>

                                    {viewMode === 'inline' ? (
                                        <div className="flex flex-col w-full min-w-max">
                                            {hunk.changes.map((change: string, idx: number) => {
                                                const type = change.startsWith('+') ? 'add' : change.startsWith('-') ? 'del' : 'context';
                                                let oNum = type === 'add' ? '' : oldLineNum++;
                                                let nNum = type === 'del' ? '' : newLineNum++;

                                                return (
                                                    <div key={idx} className={`flex w-full hover:bg-white/[0.04] ${type === 'add' ? 'bg-green-500/[0.08] text-green-200' : type === 'del' ? 'bg-red-500/[0.08] text-red-200' : 'text-slate-300'}`}>
                                                        <div className="w-12 flex-shrink-0 text-right pr-3 text-slate-500 select-none border-r border-white/5 opacity-70 pt-[1px]">{oNum}</div>
                                                        <div className="w-12 flex-shrink-0 text-right pr-3 text-slate-500 select-none border-r border-white/10 bg-white/[0.01] opacity-70 pt-[1px]">{nNum}</div>
                                                        <div className="pl-4 whitespace-pre pr-8 py-[1px]">{change}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // Split View
                                        <table className="w-full min-w-max border-collapse">
                                            <tbody>
                                                {(() => {
                                                    const rows: React.ReactNode[] = [];
                                                    let i = 0;
                                                    while (i < hunk.changes.length) {
                                                        const change = hunk.changes[i];
                                                        if (change.startsWith(' ') || !change) {
                                                            rows.push(
                                                                <tr key={i} className="hover:bg-white/[0.04] text-slate-300">
                                                                    <td className="w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70">{oldLineNum++}</td>
                                                                    <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-white/5">{change.substring(1)}</td>
                                                                    <td className="w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70">{newLineNum++}</td>
                                                                    <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px]">{change.substring(1)}</td>
                                                                </tr>
                                                            );
                                                            i++;
                                                        } else if (change.startsWith('-')) {
                                                            // Gather contiguous block of deletions
                                                            let delBatch = [];
                                                            while (i < hunk.changes.length && hunk.changes[i].startsWith('-')) {
                                                                delBatch.push(hunk.changes[i]);
                                                                i++;
                                                            }
                                                            // Gather contiguous block of additions (replacements)
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
                                                                    <tr key={`${i}-${r}`} className="hover:bg-white/[0.04]">
                                                                        <td className={`w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70 ${delChange ? 'bg-red-500/[0.04]' : ''}`}>
                                                                            {delChange ? oldLineNum++ : ''}
                                                                        </td>
                                                                        <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-white/5 ${delChange ? 'bg-red-500/[0.08] text-red-200' : ''}`}>
                                                                            {delChange ? delChange.substring(1) : ''}
                                                                        </td>
                                                                        <td className={`w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70 ${addChange ? 'bg-green-500/[0.04]' : ''}`}>
                                                                            {addChange ? newLineNum++ : ''}
                                                                        </td>
                                                                        <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] ${addChange ? 'bg-green-500/[0.08] text-green-200' : ''}`}>
                                                                            {addChange ? addChange.substring(1) : ''}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        } else if (change.startsWith('+')) {
                                                            rows.push(
                                                                <tr key={i} className="hover:bg-white/[0.04]">
                                                                    <td className="w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70"></td>
                                                                    <td className="w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] border-r border-white/5"></td>
                                                                    <td className="w-12 align-top text-right pr-3 pt-[1px] text-slate-500 select-none border-r border-white/5 opacity-70 bg-green-500/[0.04]">{newLineNum++}</td>
                                                                    <td className={`w-1/2 align-top whitespace-pre pl-3 pr-4 py-[1px] bg-green-500/[0.08] text-green-200`}>
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
                </div>
            ))}
        </div>
    );
}
