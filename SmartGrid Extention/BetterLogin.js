(function() {
    function applySmartGridVerticalLogin() {
        // Controleer of de Smartschool login-app aanwezig is
        const rightContainer = document.querySelector('.login-app__right');
        if (!rightContainer) return;

        // Als onze custom stijl er al staat, hoeven we hem niet opnieuw toe te voegen
        if (document.getElementById('smartgrid-perfect-vertical')) return;

        const style = document.createElement('style');
        style.id = 'smartgrid-perfect-vertical';
        style.innerHTML = `
            /* ==========================================================================
               SMARTGRID: COMPACT VERTICAL RECTANGLE - FLAT SOLID WHITE (NO SHADOWS)
               ========================================================================== */

            /* 1. VERWIJDER OVERBODIGE SMARTSCHOOL LAY-OUT ELEMENTEN */
            .login-app__school-logo,          /* Oud logo weg */
            .login-app__school-name,          /* Oude schoolnaam weg */
            .login-app__title--separator,     /* De "of" streep weg */
            .login-app__title--sign-in-with,  /* Extra tekstjes weg */
            .login-app__bottom,               /* De onderste footer-links weg */
            .login-app__link--password,       /* Standaard wachtwoord vergeten link */
            .login-app__platform-indicator    /* Oranje indicator bovenaan weg */ {
                display: none !important;
            }

            /* Schakel alle storende oranje lijntjes en achtergrond-pseudo-elementen uit */
            .login-app__right::before, 
            .login-app__right::after,
            .login-app__container::before,
            .login-app__container::after,
            .login-app__form::before,
            .login-app__form::after {
                display: none !important;
                content: none !important;
                background: none !important;
            }

            /* 2. MAAK VAN DE PAGINA EEN VOLLEDIG SCHERMVULLENDE ACHTERGROND */
            body, html {
                margin: 0 !important;
                padding: 0 !important;
                height: 100vh !important;
                width: 100vw !important;
                overflow: hidden !important;
            }

            #smscMain, .login-app, .login-app__container {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: transparent !important;
            }

            .login-app__left {
                display: none !important;
            }

            /* De hoofdcontainer vult het HELE scherm met de stadsachtergrond */
            .login-app__right {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 1 !important;
                
                background-image: url("https://www.smartschool.be/smsctip/2018_herobg_smartschool_city.jpg") !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }

            /* 3. HET COMPACTE INLOGVENSTER: VOLLEDIG WIT EN GEEN SCHADUW MEER */
            .login-app__top {
                position: relative !important;
                z-index: 5 !important;
                
                width: 100% !important;
                max-width: 370px !important;
                height: auto !important;
                
                display: flex !important;
                flex-direction: column !important;
                justify-content: min-content !important;
                align-items: center !important;
                
                padding: 2.5rem 2rem !important;
                border-radius: 24px !important;
                box-sizing: border-box !important;
                
                background: #ffffff !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                
                border: 1px solid #cbd5e1 !important; /* Iets duidelijkere rand nu de schaduw weg is */
                box-shadow: none !important;          /* VERANDERD: Alle vensterschaduw is nu weg! */
            }

            /* 4. CUSTOM SMARTGRID TITEL */
            .smartgrid-brand-title {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                font-size: 2.2rem !important;
                font-weight: 800 !important;
                letter-spacing: -1px !important;
                color: #0f172a !important;
                margin-top: 0 !important;
                margin-bottom: 1.75rem !important;
                text-align: center !important;
                -webkit-text-fill-color: #0f172a !important;
                text-shadow: none !important; /* Geen schaduw achter de letters */
            }

            .login-app__form, form.form {
                width: 100% !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: stretch !important;
            }

            /* 5. INPUTVELDEN (NÓG IETS VERDER UIT ELKAAR) */
            .float-label {
                margin-bottom: 1.65rem !important; /* VERANDERD: Van 1.25rem naar 1.65rem voor nóg meer ruimte */
                background: transparent !important;
                position: relative !important;
                width: 100% !important;
            }

            .float-label__input {
                width: 100% !important;
                padding: 14px 16px !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 14px !important;
                font-size: 0.95rem !important;
                background: #f8fafc !important;
                color: #0f172a !important;
                box-sizing: border-box !important;
                transition: all 0.2s ease !important;
                box-shadow: none !important; /* Geen schaduw */
            }

            input[type="password"].float-label__input,
            input[type="text"].float-label__input {
                padding-right: 44px !important; 
            }

            .float-label label {
                color: #64748b !important;
                font-weight: 500 !important;
            }

            .float-label__input:focus {
                background: #ffffff !important;
                border-color: #ff6600 !important;
                box-shadow: none !important; /* Geen focus gloed/schaduw */
                outline: none !important;
            }

            /* HET WACHTWOORD OOGJE IN HET INPUTVELD */
            .form__eye-icon {
                position: absolute !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                right: 14px !important;
                left: auto !important;
                margin: 0 !important;
                cursor: pointer !important;
                z-index: 10 !important;
                filter: brightness(0.4) !important;
                opacity: 0.7 !important;
                transition: opacity 0.2s !important;
            }

            .form__eye-icon:hover {
                opacity: 1 !important;
            }

            /* 6. ORANJE AANMELDKNOP (ZONDER SCHADUW) */
            .smscButton.blue {
                background: #ff6600 !important;
                color: #ffffff !important;
                padding: 14px !important;
                border-radius: 14px !important;
                font-weight: 600 !important;
                border: none !important;
                width: 100% !important;
                cursor: pointer !important;
                margin-top: 0.5rem !important;
                margin-bottom: 1.25rem !important;
                box-shadow: none !important; /* VERANDERD: De oranje schaduw gloed is hier ook weg */
                transition: background 0.2s ease !important;
            }

            .smscButton.blue:hover:not([disabled]) {
                background: #e05500 !important;
                box-shadow: none !important;
            }

            /* 7. APARTE SECTIE VOOR SSO KNOPPEN (MICROSOFT / OVERHEID) */
            .smartgrid-sso-container {
                width: 100% !important;
                margin-top: 0 !important;
                padding-top: 1.25rem !important;
                border-top: 1px solid #e2e8f0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: stretch !important;
            }

            .smartgrid-sso-container a.smscButton {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                color: #1e293b !important;
                border-radius: 14px !important;
                padding: 12px !important;
                margin-bottom: 0.65rem !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                cursor: pointer !important;
                box-sizing: border-box !important;
                transition: all 0.2s ease !important;
                width: 100% !important;
                box-shadow: none !important; /* Geen schaduw */
            }

            .smartgrid-sso-container a.smscButton:last-of-type {
                margin-bottom: 0 !important;
            }

            .smartgrid-sso-container a.smscButton:hover {
                background: #f8fafc !important;
                transform: translateY(-1px) !important;
                box-shadow: none !important;
            }

            .login-app__button-icon {
                margin-right: 12px !important;
            }
        `;
        document.head.appendChild(style);

        // --- DYNAMISCH STRUCTUUR VERANDEREN MET JAVASCRIPT ---
        
        // 1. Voeg de "SmartGrid" titel toe als deze er nog niet staat
        if (!document.querySelector('.smartgrid-brand-title')) {
            const brandTitle = document.createElement('div');
            brandTitle.className = 'smartgrid-brand-title';
            brandTitle.innerText = 'SmartGrid';
            const thisContainer = document.querySelector('.login-app__top');
            if (thisContainer) {
                thisContainer.insertBefore(brandTitle, thisContainer.firstChild);
            }
        }

        // 2. Bouw de aparte container voor Microsoft & Overheid knoppen op
        if (!document.querySelector('.smartgrid-sso-container')) {
            const ssoContainer = document.createElement('div');
            ssoContainer.className = 'smartgrid-sso-container';

            const ssoButtons = document.querySelectorAll('.login-app__form a.smscButton');
            
            ssoButtons.forEach(btn => {
                if (btn.getAttribute('data-href') && !btn.getAttribute('href')) {
                    btn.setAttribute('href', btn.getAttribute('data-href'));
                }
                ssoContainer.appendChild(btn);
            });

            const topBox = document.querySelector('.login-app__top');
            if (topBox && ssoContainer.children.length > 0) {
                topBox.appendChild(ssoContainer);
            }
        }
    }

    applySmartGridVerticalLogin();

    const watchInterval = setInterval(applySmartGridVerticalLogin, 100);
    setTimeout(() => clearInterval(watchInterval), 3000);

    const observer = new MutationObserver(applySmartGridVerticalLogin);
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();