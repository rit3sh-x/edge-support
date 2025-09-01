import { EMBED_CONFIG } from './config';
import { chatBubbleIcon, closeIcon } from './icons';

(function () {
    let iframe: HTMLIFrameElement | null = null;
    let container: HTMLDivElement | null = null;
    let button: HTMLButtonElement | null = null;
    let isOpen = false;

    let organizationId: string | null = null;
    let position: 'bottom-right' | 'bottom-left' = EMBED_CONFIG.DEFAULT_POSITION;

    const currentScript = document.currentScript as HTMLScriptElement;
    if (currentScript) {
        organizationId = currentScript.getAttribute('data-organization-id');
        position = (currentScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
    } else {
        const scripts = document.querySelectorAll('script[src*="embed"]');
        const embedScript = Array.from(scripts).find(script =>
            script.hasAttribute('data-organization-id')
        ) as HTMLScriptElement;

        if (embedScript) {
            organizationId = embedScript.getAttribute('data-organization-id');
            position = (embedScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
        }
    }

    if (!organizationId) {
        console.error('Edge Widget: data-organization-id attribute is required');
        return;
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', render);
        } else {
            render();
        }
    }

    function render() {
        button = document.createElement('button');
        button.id = 'edge-widget-button';
        button.innerHTML = chatBubbleIcon;
        button.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
    `;

        button.addEventListener('click', toggleWidget);
        button.addEventListener('mouseenter', () => {
            if (button) button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            if (button) button.style.transform = 'scale(1)';
        });

        document.body.appendChild(button);

        container = document.createElement('div');
        container.id = 'edge-widget-container';
        container.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;

        iframe = document.createElement('iframe');
        iframe.src = buildWidgetUrl();
        iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;

        iframe.allow = 'microphone; clipboard-read; clipboard-write';

        container.appendChild(iframe);
        document.body.appendChild(container);

        window.addEventListener('message', handleMessage);
    }

    function buildWidgetUrl(): string {
        const params = new URLSearchParams();
        params.append('organizationId', organizationId!);
        return `${EMBED_CONFIG.WIDGET_URL}?${params.toString()}`;
    }

    function handleMessage(event: MessageEvent) {
        if (event.origin !== new URL(EMBED_CONFIG.WIDGET_URL).origin) return;

        const { type, payload } = event.data;

        switch (type) {
            case 'close':
                hide();
                break;
            case 'resize':
                if (payload.height && container) {
                    container.style.height = `${payload.height}px`;
                }
                break;
        }
    }

    function toggleWidget() {
        if (isOpen) {
            hide();
        } else {
            show();
        }
    }

    function show() {
        if (container && button) {
            isOpen = true;
            container.style.display = 'block';
            setTimeout(() => {
                if (container) {
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }
            }, 10);
            button.innerHTML = closeIcon;
        }
    }

    function hide() {
        if (container && button) {
            isOpen = false;
            container.style.opacity = '0';
            container.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (container) container.style.display = 'none';
            }, 300);
            button.innerHTML = chatBubbleIcon;
            button.style.background = '#3b82f6';
        }
    }

    function destroy() {
        window.removeEventListener('message', handleMessage);
        if (container) {
            container.remove();
            container = null;
            iframe = null;
        }
        if (button) {
            button.remove();
            button = null;
        }
        isOpen = false;
    }

    function reinit(newConfig: { organizationId?: string; position?: 'bottom-right' | 'bottom-left' }) {
        destroy();

        if (newConfig.organizationId) {
            organizationId = newConfig.organizationId;
        }
        if (newConfig.position) {
            position = newConfig.position;
        }

        init();
    }

    (window as any).EdgeWidget = {
        init: reinit,
        show,
        hide,
        destroy
    };

    init();
})();