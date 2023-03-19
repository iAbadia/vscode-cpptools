/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { BaseNode, LabelLeafNode } from './common';
import * as nls from 'vscode-nls';

nls.config({ messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })();
const localize: nls.LocalizeFunc = nls.loadMessageBundle();

// DEBUG: For now use this as the list of checkpoints
let _checkpoints: string[];

export class CheckpointsProvider implements vscode.TreeDataProvider<BaseNode>, vscode.Disposable {
    private readonly _onDidChangeTreeData: vscode.EventEmitter<BaseNode | undefined> = new vscode.EventEmitter<BaseNode | undefined>();

    public get onDidChangeTreeData(): vscode.Event<BaseNode | undefined> {
        return this._onDidChangeTreeData.event;
    }

    async getChildren(node?: BaseNode): Promise<BaseNode[]> {
        if (node) {
            return node.getChildren();
        }

        const children: BaseNode[] = await this.getCheckpoints();
        if (children.length === 0) {
            return [new LabelLeafNode(localize('no.checkpoints', 'No Checkpoints'))];
        }

        return children;
    }

    getTreeItem(node: BaseNode): Promise<vscode.TreeItem> {
        return node.getTreeItem();
    }

    refresh(node?: BaseNode): void {
        this._onDidChangeTreeData.fire(node);
    }

    dispose(): void {
        this._onDidChangeTreeData.dispose();
    }

    private async getCheckpoints(): Promise<BaseNode[]> {
        const targetNodes: BaseNode[] = [];
        _checkpoints = [
            'checkpoint1',
            'checkpoint2',
        ]
        for (const key in _checkpoints) {
            targetNodes.push(new LabelLeafNode(_checkpoints[key]));
        }
        return targetNodes;
    }
}

// export async function initializeCheckpoints(): Promise<void> {
//     _targets = await getSshConfigHostInfos();
//     let activeTargetRemoved: boolean = true;
//     const cachedActiveTarget: string | undefined = await getActiveSshTarget(false);
//     for (const host of Array.from(_targets.keys())) {
//         if (host === cachedActiveTarget) {
//             activeTargetRemoved = false;
//         }
//     }
//     if (activeTargetRemoved) {
//         setActiveSshTarget(undefined);
//     }
//     await setActiveSshTarget(extensionContext?.workspaceState.get(workspaceState_activeSshTarget));
// }

// export async function getActiveSshTarget(selectWhenNotSet: boolean = true): Promise<string | undefined> {
//     if (_targets.size === 0 && !selectWhenNotSet) {
//         return undefined;
//     }
//     if (!_activeTarget && selectWhenNotSet) {
//         const name: string | undefined = await selectSshTarget();
//         if (!name) {
//             throw Error(localize('active.ssh.target.selection.cancelled', 'Active SSH target selection cancelled.'));
//         }
//         await setActiveSshTarget(name);
//         await vscode.commands.executeCommand(refreshCppSshTargetsViewCmd);
//     }
//     return _activeTarget;
// }

// const addNewSshTarget: string = localize('add.new.ssh.target', '{0} Add New SSH Target...', '$(plus)');

// export async function selectSshTarget(): Promise<string | undefined> {
//     const items: string[] = Array.from(_targets.keys());
//     // Special item for adding SSH target
//     items.push(addNewSshTarget);
//     const selection: string | undefined = await vscode.window.showQuickPick(items, { title: localize('select.ssh.target', 'Select an SSH target') });
//     if (!selection) {
//         return undefined;
//     }
//     if (selection === addNewSshTarget) {
//         return vscode.commands.executeCommand(addSshTargetCmd);
//     }
//     return selection;
// }


export const refreshCppCheckpointsViewCmd: string = 'C_Cpp.refreshCppCheckpointsView';
export const addCheckpointCmd: string = 'C_Cpp.addCheckpoint';
export const removeCheckpointCmd: string = 'C_Cpp.removeCheckpoint';