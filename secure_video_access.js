/**
 * Script de Controle de Acesso Seguro - Ficha de Serviço Video
 * Bloqueia acesso mobile e protege URL do AppSheet Video
 */

class SecureVideoAppSheetAccess {
    constructor() {
        // URL codificada do AppSheet Video
        this.encodedUrl = 'aHR0cHM6Ly93d3cuYXBwc2hlZXQuY29tL3N0YXJ0LzQ4MGZmZDUzLWQzMTAtNGExNC05NmUwLTY2OGU5ODhmODM4OA==';
        
        this.init();
    }

    // Decodifica a URL de forma segura
    getAppSheetUrl() {
        try {
            return atob(this.encodedUrl);
        } catch(e) {
            console.error('Erro ao decodificar URL do AppSheet Video');
            return null;
        }
    }

    // Detecta dispositivos móveis
    isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobilePatterns = [
            /android/i,
            /webos/i,
            /iphone/i,
            /ipad/i,
            /ipod/i,
            /blackberry/i,
            /windows phone/i,
            /opera mini/i,
            /iemobile/i,
            /mobile/i
        ];

        // Verifica user agent
        const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
        
        // Verifica características de tela
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Verifica orientação
        const hasOrientation = typeof window.orientation !== 'undefined';
        
        return isMobileUA || (isSmallScreen && isTouchDevice) || hasOrientation;
    }

    // Verifica se é desktop válido (requisitos mais rigorosos para vídeo)
    isValidDesktop() {
        return !this.isMobileDevice() && 
               window.innerWidth >= 1280 && // Maior resolução para vídeo
               window.innerHeight >= 720 &&
               !('ontouchstart' in window);
    }

    // Aplica medidas de segurança
    applySecurity() {
        // Limpa histórico
        if (history.replaceState) {
            history.replaceState(null, '', window.location.pathname);
        }

        // Desabilita teclas de desenvolvedor
        document.addEventListener('keydown', (e) => {
            const forbiddenKeys = [
                'F12',
                'F11', // Fullscreen que pode revelar URL
                'F5',  // Refresh que pode mostrar URL
            ];

            const forbiddenCombos = [
                e.ctrlKey && e.key === 'u', // View source
                e.ctrlKey && e.shiftKey && e.key === 'I', // DevTools
                e.ctrlKey && e.shiftKey && e.key === 'J', // Console
                e.ctrlKey && e.shiftKey && e.key === 'C', // Inspector
                e.ctrlKey && e.key === 's', // Save page
                e.ctrlKey && e.key === 'a', // Select all
                e.ctrlKey && e.key === 'p', // Print
                e.ctrlKey && e.key === 'f', // Find
                e.ctrlKey && e.key === 'h', // History
                e.ctrlKey && e.key === 'j', // Downloads
                e.ctrlKey && e.key === 'k', // Search
                e.ctrlKey && e.key === 'l', // Address bar
                e.ctrlKey && e.key === 'r', // Refresh
                e.ctrlKey && e.key === 't', // New tab
                e.ctrlKey && e.key === 'w', // Close tab
                e.ctrlKey && e.shiftKey && e.key === 'Delete', // Clear data
                e.altKey && e.key === 'F4', // Close window
            ];

            if (forbiddenKeys.includes(e.key) || forbiddenCombos.some(combo => combo)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Desabilita menu de contexto
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Desabilita seleção de texto
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });

        // Desabilita drag and drop
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        // Monitora tentativas de abrir DevTools
        let devtools = {open: false, orientation: null};
        const threshold = 160;

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.handleSecurityViolation();
                }
            } else {
                devtools.open = false;
            }
        }, 500);

        // Limpa console periodicamente
        setInterval(() => {
            console.clear();
        }, 3000);

        // Previne zoom
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        });

        // Monitora mudanças de foco
        window.addEventListener('blur', () => {
            // Aplicação perdeu foco - possível tentativa de inspecionar
            setTimeout(() => {
                if (document.hasFocus()) {
                    console.clear();
                }
            }, 100);
        });

        // Proteções específicas para vídeo
        this.applyVideoSecurity();
    }

    // Aplica proteções específicas para aplicações de vídeo
    applyVideoSecurity() {
        // Desabilita picture-in-picture se disponível
        if ('pictureInPictureEnabled' in document) {
            document.addEventListener('enterpictureinpicture', (e) => {
                e.preventDefault();
            });
        }

        // Monitora fullscreen para vídeos
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                // Saiu do fullscreen - aplica segurança novamente
                this.applySecurity();
            }
        });

        // Desabilita download de vídeo (quando possível)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'VIDEO') {
                e.preventDefault();
                return false;
            }
        });

        // Monitora tentativas de captura de tela
        if ('getDisplayMedia' in navigator.mediaDevices) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = () => {
                this.handleSecurityViolation();
                return Promise.reject(new Error('Captura de tela não permitida'));
            };
        }
    }

    // Manipula violações de segurança
    handleSecurityViolation() {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #ff3b30;
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                font-size: 24px;
                z-index: 99999;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">🚫</div>
                <div style="font-size: 1.5em; margin-bottom: 10px;">ACESSO NEGADO</div>
                <div style="font-size: 1em;">VIOLAÇÃO DE SEGURANÇA DETECTADA</div>
                <div style="font-size: 0.8em; margin-top: 20px;">Aplicação de Vídeo Protegida</div>
            </div>
        `;
        
        // Redireciona após alguns segundos
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 3000);
    }

    // Carrega o AppSheet Video de forma segura
    loadAppSheet() {
        const url = this.getAppSheetUrl();
        if (!url) {
            this.showError('Erro interno do sistema de vídeo');
            return;
        }

        // Remove todo o conteúdo da página
        document.body.innerHTML = '';
        
        // Cria iframe fullscreen
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            z-index: 9999;
            background: white;
        `;
        
        iframe.src = url;
        iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads';
        
        document.body.appendChild(iframe);

        // Aplica segurança adicional após carregar
        iframe.onload = () => {
            this.applySecurity();
            
            // Tenta ocultar a URL (limitado por CORS)
            try {
                history.replaceState({}, '', '/video');
            } catch(e) {}
        };
    }

    // Mostra erro para dispositivos móveis
    showMobileError() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 100%;
                ">
                    <div style="font-size: 4em; margin-bottom: 20px;">🎥</div>
                    <h1 style="color: #ff3b30; margin-bottom: 20px; font-size: 2em;">
                        🚫 Acesso Restrito
                    </h1>
                    <h2 style="color: #666; margin-bottom: 20px; font-size: 1.3em;">
                        Ficha de Serviço Video
                    </h2>
                    <p style="color: #333; font-size: 1.1em; line-height: 1.6; margin-bottom: 20px;">
                        Este aplicativo de <strong>vídeo</strong> só pode ser acessado através de um <strong>computador desktop</strong>.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #495057; margin-bottom: 15px;">Requisitos para Vídeo:</h3>
                        <ul style="text-align: left; color: #6c757d; line-height: 1.8;">
                            <li>Computador Desktop ou Laptop</li>
                            <li>Resolução mínima: 1280x720 (HD)</li>
                            <li>Navegador desktop (não mobile)</li>
                            <li>Conexão estável para streaming</li>
                        </ul>
                    </div>
                    <p style="color: #dc3545; font-weight: bold;">
                        Dispositivos móveis não suportam adequadamente aplicações de vídeo profissionais.
                    </p>
                </div>
            </div>
        `;
    }

    // Mostra erro genérico
    showError(message) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #dc3545;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 18px;
                text-align: center;
                padding: 20px;
            ">
                🎥 ❌ ${message}
            </div>
        `;
    }

    // Inicializa o sistema
    init() {
        // Aplica segurança básica imediatamente
        this.applySecurity();

        // Aguarda carregamento completo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAccess());
        } else {
            this.checkAccess();
        }

        // Monitora redimensionamento
        window.addEventListener('resize', () => {
            if (this.isMobileDevice()) {
                this.showMobileError();
            }
        });
    }

    // Verifica acesso e carrega aplicação
    checkAccess() {
        // Simula verificação de segurança
        setTimeout(() => {
            if (this.isValidDesktop()) {
                this.loadAppSheet();
            } else {
                this.showMobileError();
            }
        }, 2000);
    }
}

// Inicializa automaticamente quando o script é carregado
new SecureVideoAppSheetAccess();

