import React from "react";
import { createRoot, Root as ReactRoot } from 'react-dom/client';
import App from "./App";

export interface WidgetOptions {
    containerElementId: string,
    name: string;
}

declare global {
    interface Window {
        renderReactWidget: (config: string) => void;
        unmountReactWidget: (id: string) => void;
    }
}

const widgetRoots: Record<string, ReactRoot> = {}

const getOptionsFromDataAttributes = (el: HTMLElement): Partial<WidgetOptions> => {
    return {
        name: el.getAttribute('data-name') || '',
    }
}

window.renderReactWidget = (config: string) => {
    let parsedOpitons: Partial<WidgetOptions> = {};

    try {
        parsedOpitons = JSON.parse(config);
    } catch {
        console.warn('Invalid JSON config,using data attributes');
    }

    const containerId = parsedOpitons.containerElementId || config;
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container "${containerId}"not found`);
        return;
    }

    const dataOptions = getOptionsFromDataAttributes(container);
    const finalOptions: WidgetOptions = {
        ...dataOptions,
        ...parsedOpitons,
        containerElementId: containerId
    } as WidgetOptions;

    if (!finalOptions.name) {
        console.error('Missing required field:name');
        return;
    }
    if (widgetRoots[containerId]) {
        widgetRoots[containerId].unmount();
    }

    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
    widgetRoots[containerId] = root;

    window.unmountReactWidget = (containerElementId: string) => {
        const root = widgetRoots[containerElementId];
        if (root) {
            root.unmount();
            delete widgetRoots[containerElementId];
        }
    }
}