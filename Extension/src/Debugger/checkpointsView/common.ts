/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';

export class CheckpointNode {
    constructor(private readonly id: string,
        private readonly label: string,
        private readonly description: string | boolean,
        private readonly tooltip: null | string,
        private readonly iconPath: null | string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon,
        private readonly command: vscode.Command,
    ) { /* blank */ }

    async getChildren(): Promise<CheckpointNode[]> {
        return [];
    }

    getTreeItem(): Promise<vscode.TreeItem> {
        // return Promise.resolve(new vscode.TreeItem(this.getLabel(), vscode.TreeItemCollapsibleState.None));
        const item = new vscode.TreeItem(this.getLabel(), vscode.TreeItemCollapsibleState.None);
        item.description = this.description
        if(this.tooltip) {
            item.tooltip = this.tooltip
        }
        if(this.iconPath) {
            item.iconPath = this.iconPath
        }
        item.command = this.command
        return Promise.resolve(item);
    }

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        return this.label;
    }

    getDescription(): string | boolean {
        return this.description;
    }

    getTooltip(): null | string {
        return this.tooltip;
    }
    
    getIconPath(): null | string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon {
        return this.iconPath;
    }

    getCommand(): vscode.Command {
        return this.command;
    }
}