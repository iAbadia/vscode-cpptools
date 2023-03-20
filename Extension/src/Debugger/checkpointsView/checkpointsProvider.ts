/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { CheckpointNode } from './common';
import * as nls from 'vscode-nls';
// import { Command } from 'vscode-languageclient';

nls.config({ messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })();

export class CheckpointsProvider implements vscode.TreeDataProvider<CheckpointNode>, vscode.Disposable {
    private readonly _onDidChangeTreeData: vscode.EventEmitter<CheckpointNode | undefined> = new vscode.EventEmitter<CheckpointNode | undefined>();

    public get onDidChangeTreeData(): vscode.Event<CheckpointNode | undefined> {
        return this._onDidChangeTreeData.event;
    }

    async getChildren(node?: CheckpointNode): Promise<CheckpointNode[]> {
        if (node) {
            return node.getChildren();
        }

        const children: CheckpointNode[] = await this.getCheckpoints();
        return children;
    }

    getTreeItem(node: CheckpointNode): Promise<vscode.TreeItem> {
        return node.getTreeItem();
    }

    refresh(node?: CheckpointNode): void {
        this._onDidChangeTreeData.fire(node);
    }

    dispose(): void {
        this._onDidChangeTreeData.dispose();
    }

    private async getCheckpoints(): Promise<CheckpointNode[]> {
        const targetNodes: CheckpointNode[] = [];
        const ds = vscode.debug.activeDebugSession;
        if (ds) {
            const args = {
                expression: '-exec info checkpoints',
                context: 'repl'
            };
            await ds.customRequest('evaluate', args).then(({ result }) => {
                console.log(result);
                // If No Checkpoints, will return empty []
                if (result !== 'No checkpoints.\n') {
                    const rawCheckpointsList = result.replace(/\n$/g, '').split('\n')
                    for (const key in rawCheckpointsList) {
                        // Each line come come in either form (* marks current):
                        //   0 process 1 (main process) at 0x0
                        // * 1 process 2 at 0x1, file ./a/b/c/file.cpp, line 13
                        let cpLine = ''
                        const rawCpLine = rawCheckpointsList[key]
                        const isCurrent = rawCpLine.charAt(0) === '*'
                        const rawCpLineSplit = rawCpLine.split(', ')
                        const isMainProcess = rawCpLineSplit[0].includes('(main process)')
                        const checkpointId = rawCpLineSplit[0].substring(2).split(' ')[0]
                        const processId = rawCpLineSplit[0].substring(2).split(' ')[2]
                        if (isMainProcess) {
                            cpLine += 'Main Process'
                        } else {
                            cpLine += 'Checkpoint ' + checkpointId
                        }
                        // If rawLine has File and Line add them
                        let description: string | boolean = false
                        if (rawCpLineSplit.length === 3) {
                            description = ''
                            const fileName = rawCpLineSplit[1].split('/').at(-1)
                            description += fileName + ':'
                            const lineNum = rawCpLineSplit[2].split(' ')[1]
                            description += lineNum
                        }
                        const icon = isCurrent ? new vscode.ThemeIcon('debug-stackframe') : null
                        const tooltip = 'PID: ' + processId
                        const command = { command: 'C_Cpp.loadCheckpoint', title : 'Load checkpoint', arguments: [checkpointId] };
                        targetNodes.push(new CheckpointNode(checkpointId, cpLine, description, tooltip, icon, command))
                    }
                }
            });
        }

        return targetNodes;
    }
}

export const refreshCppCheckpointsViewCmd: string = 'C_Cpp.refreshCppCheckpointsView';
export const addCheckpointCmd: string = 'C_Cpp.addCheckpoint';
export const removeCheckpointCmd: string = 'C_Cpp.removeCheckpoint';
export const loadCheckpointCmd: string = 'C_Cpp.loadCheckpoint';