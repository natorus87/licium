export const translations = {
    de: {
        trash: {
            title: 'Papierkorb',
            emptyTrash: 'Papierkorb leeren',
            restore: 'Wiederherstellen',
            deletePermanently: 'Endgültig löschen'
        },
        general: {
            loading: 'Laden...',
            save: 'Speichern',
            cancel: 'Abbrechen',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            create: 'Erstellen',
            close: 'Schließen',
            confirm: 'Bestätigen',
            showExplorer: 'Explorer einblenden',
            hideExplorer: 'Explorer ausblenden',
            showChat: 'Chat einblenden',
            hideChat: 'Chat ausblenden',
            lightMode: 'Heller Modus',
            darkMode: 'Dunkler Modus',
            logout: 'Abmelden'
        },
        sidebar: {
            explorer: 'EXPLORER',
            newNote: 'Neue Notiz',
            newFolder: 'Neuer Ordner',
            rename: 'Umbenennen',
            delete: 'Löschen',
            duplicate: 'Duplizieren',
            searchPlaceholder: 'Notizen suchen...',
            quickNote: 'Schnellnotiz',
        },
        editor: {
            placeholder: 'Beginnen Sie zu schreiben...',
            saving: 'Speichern...',
            saved: 'Gespeichert',
            error: 'Fehler',
            saveNow: 'Jetzt speichern',
            noSelection: 'Wählen Sie eine Notiz zum Bearbeiten aus',
            autoSave: 'Automatische Speicherung',
            emptyState: 'Wählen Sie eine Notiz zum Bearbeiten aus',
            history: 'Verlauf',
            restore: 'Wiederherstellen',
            version: 'Version',
            restoreConfirm: 'Möchten Sie diese Version wirklich wiederherstellen? Der aktuelle Inhalt wird überschrieben.',
            current: 'Aktuell',
            noVersions: 'Keine älteren Versionen vorhanden.',
            insertDiagram: 'Diagramm einfügen',
            words: 'Wörter',
            chars: 'Zeichen'
        },
        audio: {
            title: 'Audio Aufnahme',
            recording: 'Aufnahme läuft...',
            processing: 'Verarbeite...',
            loading: 'Warte auf KI-Modell...',
            clickToRecord: 'Klicken zur Aufnahme',
            clickToStop: 'Klicken zum Beenden',
            tapToStart: 'Mikrofon tippen zum Starten',
            sending: 'Sende Audio an Whisper...',
            loadingMessage: 'Das Modell wird geladen. Bitte warten...',
            coldStart: 'Erster Start kann bis zu 30s dauern'
        },
        // ... (Adding to other languages implicitly for brevity here, but strictly I must provide exact TargetContent for Replace. 
        // Since the file structure is nested, I should probably do multiple replacements or one big one.
        // Given the tool limitations, I will use MultiReplace to inject into each language block safely.)

        chat: {
            title: 'AI Assistant',
            placeholder: 'Frag AI...',
            clearHistory: 'Chatverlauf löschen',
            emptyState: 'Fragen Sie mich alles über Ihre Notizen!',
            thinking: 'AI denkt nach...',
            actions: {
                summarize: { label: 'Zusammenfassen', prompt: 'Fasse diese Notiz zusammen' },
                rewrite: { label: 'Umschreiben', prompt: 'Schreibe diese Notiz verständlicher um' },
                structure: { label: 'Struktur', prompt: 'Schlage eine Struktur/Gliederung für diese Notiz vor' },
                keyPoints: { label: 'Wichtige Punkte', prompt: 'Generiere 5 wichtige Stichpunkte' },
                spelling: { label: 'Rechtschreibung', prompt: 'Korrigiere die Rechtschreibung und Grammatik dieses Textes. Behalte den Inhalt bei.' },
                eli5: { label: 'Einfach erklären', prompt: 'Erkläre es mir, als wäre ich 5. Komplexe Sachverhalte extrem simpel herunterbrechen.' },
                glossary: { label: 'Glossar', prompt: 'Extrahiere schwierige Fachbegriffe aus dem Text und liste deren Definitionen auf.' },
                table: { label: 'Tabelle', prompt: 'Versuche, strukturierte Daten im Text zu finden und als Markdown-Tabelle auszugeben.' },
            },
            buttons: {
                replace: 'Ersetzen',
                append: 'Anhängen'
            },
            confirmClearMessage: 'Sind Sie sicher, dass Sie den gesamten Verlauf löschen möchten?',
            customPrompts: {
                add: 'Neu',
                delete: 'Löschen',
                confirmDelete: 'Diesen Prompt löschen?',
                modalTitle: 'Neuen Prompt hinzufügen',
                modalMessage: 'Format: Label|Prompt (z.B. "Übersetzen|Übersetze dies ins Englische:")',
                addButton: 'Hinzufügen',
                edit: 'Bearbeiten',
                modalTitleEdit: 'Prompt bearbeiten'
            },
            privacyNotice: {
                searchActive: 'Websuche aktiv (Datenschutzhinweis)',
                searchInactive: 'Lokaler AI-Modus (Kein Datenabfluss)',
                privacyWarning: 'Externes AI-Modell (Datenschutz-Warnung)',
                localMode: 'Lokaler AI-Modus'
            }
        },
        settings: {
            title: 'Einstellungen',
            tabs: {
                general: 'Allgemein',
                llm: 'LLM (Chat)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Werkzeuge',

                account: 'Konto',
                users: 'Benutzerverwaltung',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'z.B. gpt-4 oder llama3',
                baseUrlExample: 'z.B. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'z.B. Lokaler TEI',
                embeddingModelExample: 'z.B. all-MiniLM-L6-v2',
                embeddingUrlExample: 'z.B. http://embeddings:8080',
                drawioUrlExample: 'z.B. /drawio',
                searxngUrlExample: 'z.B. http://searxng:8080'
            },
            account: {
                title: 'Mein Konto',
                loggedInAs: 'Angemeldet als:',
                changePassword: 'Passwort ändern',
                enterNewPassword: 'Geben Sie Ihr neues Passwort ein:',
                success: 'Passwort erfolgreich geändert',
                error: 'Passwortänderung fehlgeschlagen'
            },
            tools: {
                title: 'Werkzeuge',
                drawio: {
                    title: 'Draw.io Integration',
                    provider: 'Anbieter',
                    cloud: 'Cloud (diagrams.net)',
                    local: 'Lokal (Self-hosted)',
                    localUrl: 'Lokale URL',
                    localUrlHelp: 'Standard: /drawio (relativ) oder vollständige URL.'
                },
                searxng: {
                    title: 'Websuche (SearXNG)',
                    adminManaged: 'Sucheinstellungen werden vom Administrator verwaltet.'
                },
                audio: {
                    title: 'Audio Transkription',
                    providerLabel: 'Transkriptions-Provider',
                    addProvider: 'Audio Provider hinzufügen',
                    modelsTitle: 'Transkriptions-Modelle',
                    providerHelp: 'Wählen Sie den Dienst für die Umwandlung von Sprache in Text.'
                }
            },
            embeddings: {
                adminManaged: 'Embedding-Einstellungen werden vom Administrator verwaltet.',
                title: 'Embedding Einstellungen (RAG)',
                providerLabel: 'Embedding Provider',
                providerHelp: 'Wählen Sie den Provider, der für die Vektorisierung Ihrer Notizen verwendet werden soll.',
                selectModelPlaceholder: '-- Wähle Embedding Model --',
                modelsTitle: 'Embedding Modelle',
                addModel: 'Embedding Modell hinzufügen'
            },
            llm: {
                adminManaged: 'LLM-Einstellungen werden vom Administrator verwaltet. Sie können die aktuelle Konfiguration unten einsehen.',
                chatModels: 'Chat Modelle',
                addModel: 'Modell hinzufügen',
                deleteConfirm: 'Möchten Sie dieses Modell wirklich löschen?'
            },
            info: {
                title: 'Informationen',
                appInfo: 'Anwendungsinformationen',
                appName: 'Anwendungsname',
                license: 'Lizenz',
                copyright: 'Copyright',
                versions: 'Versionen',
                frontendVersion: 'Frontend-Version',
                backendVersion: 'Backend-Version',
                buildDate: 'Build-Datum',
                systemInfo: 'Systeminformationen',
                nodeVersion: 'Node.js Version',
                databaseStatus: 'Datenbankstatus',
                serverUptime: 'Server-Laufzeit',
                connected: 'Verbunden',
                disconnected: 'Nicht verbunden',
                links: 'Links',
                repository: 'GitHub Repository',
                documentation: 'Dokumentation',
                loading: 'Lade...',
                error: 'Fehler beim Laden der Systeminformationen'
            },
            labels: {
                language: 'Sprache / Language',
                provider: 'Anbieter-Typ',
                providerName: 'Provider Name',
                category: 'Kategorie',
                categoryChat: 'Chat (Text-Generierung)',
                categoryEmbedding: 'Embedding (Vektorisierung)',
                typeCustom: 'Benutzerdefiniert (OpenAI Kompatibel)',
                typeTransformers: 'Lokale Transformers (K8s)',
                model: 'Modellname',
                baseUrl: 'Basis-URL',
                apiKey: 'API-Schlüssel',
                searxng: 'SearXNG URL (Optional)',
                searxngHelp: 'Ermöglicht Websuche für den AI-Assistenten.',
                addProvider: 'Anbieter hinzufügen',
                deleteProvider: 'Anbieter löschen',
                selectModel: 'Modell auswählen',
                privacyMode: 'Datenschutz-Modus',
                privacyLocal: 'Lokal (Privat)',
                privacyExternal: 'Extern (Öffentlich/Cloud)',
                privacyWarning: 'Externes AI-Modell (Datenschutz-Warnung)',
                localMode: 'Lokaler AI-Modus',
                saveGlobal: 'Globale Einstellungen speichern',
                active: 'Standard',
                setDefault: 'Als Standard setzen'
            },

            userManagement: {
                title: 'Benutzerverwaltung',
                addUser: 'Benutzer hinzufügen',
                publicRegistration: {
                    title: 'Öffentliche Registrierung',
                    description: 'Wenn deaktiviert, können sich neue Benutzer nicht selbst registrieren. Administratoren können weiterhin Benutzer hinzufügen.'
                },
                table: {
                    username: 'Benutzername',
                    role: 'Rolle',
                    created: 'Erstellt',
                    actions: 'Aktionen',
                    you: '(Du)',
                    loading: 'Lade Benutzer...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'Benutzer'
                },
                modals: {
                    create: {
                        title: 'Benutzer erstellen',
                        message: 'Geben Sie den Benutzernamen für den neuen Benutzer ein:',
                        success: 'Benutzer erfolgreich erstellt',
                        error: 'Benutzer konnte nicht erstellt werden'
                    },
                    password: {
                        title: 'Passwort festlegen',
                        messageName: 'Geben Sie das Passwort für {name} ein:',
                        resetTitle: 'Passwort zurücksetzen',
                        resetMessage: 'Geben Sie ein neues Passwort für {name} ein:',
                        success: 'Passwort aktualisiert'
                    },
                    delete: {
                        title: 'Benutzer löschen',
                        message: 'Sind Sie sicher, dass Sie den Benutzer "{name}" löschen möchten? Dies wird alle seine Notizen löschen.'
                    },
                    role: {
                        title: 'Rolle ändern',
                        message: 'Rolle von {name} zu {role} ändern?'
                    }
                }
            }
        }
    },
    en: {
        trash: {
            title: 'Trash',
            emptyTrash: 'Empty Trash',
            restore: 'Restore',
            deletePermanently: 'Delete Permanently'
        },
        general: {
            loading: 'Loading...',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            create: 'Create',
            close: 'Close',
            confirm: 'Confirm',
            showExplorer: 'Show Explorer',
            hideExplorer: 'Hide Explorer',
            showChat: 'Show Chat',
            hideChat: 'Hide Chat',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            logout: 'Logout'
        },
        sidebar: {
            explorer: 'EXPLORER',
            newNote: 'New Note',
            newFolder: 'New Folder',
            rename: 'Rename',
            delete: 'Delete',
            duplicate: 'Duplicate',
            searchPlaceholder: 'Search notes...',
            quickNote: 'Quick Note',
        },
        editor: {
            placeholder: 'Start writing...',
            saving: 'Saving...',
            saved: 'Saved',
            error: 'Error',
            saveNow: 'Save Now',
            noSelection: 'Select a note to edit',
            autoSave: 'Auto-saving',
            emptyState: 'Select a note to edit',
            history: 'History',
            restore: 'Restore',
            version: 'Version',
            restoreConfirm: 'Revert to this version? Current changes will be lost.',
            current: 'Current',
            noVersions: 'No previous versions available.',
            insertDiagram: 'Insert Diagram',
            words: 'Words',
            chars: 'Chars'
        },
        audio: {
            title: 'Record Audio',
            recording: 'Recording...',
            processing: 'Processing...',
            loading: 'Waiting for AI model...',
            clickToRecord: 'Click to record',
            clickToStop: 'Click to stop',
            tapToStart: 'Tap microphone to start',
            sending: 'Sending audio to Whisper...',
            loadingMessage: 'Loading model. Please wait...',
            coldStart: 'First start may take up to 30s'
        },
        chat: {
            title: 'AI Assistant',
            placeholder: 'Ask AI...',
            clearHistory: 'Clear chat history',
            emptyState: 'Ask me anything about your notes!',
            thinking: 'AI is thinking...',
            actions: {
                summarize: { label: 'Summarize', prompt: 'Summarize this note' },
                rewrite: { label: 'Rewrite', prompt: 'Rewrite this note to be more understandable' },
                structure: { label: 'Structure', prompt: 'Suggest a structure/outline for this note' },
                keyPoints: { label: 'Key Points', prompt: 'Generate 5 key bullet points' },
                spelling: { label: 'Spelling', prompt: 'Correct the spelling and grammar of this text. Keep the content.' },
                eli5: { label: 'ELI5', prompt: 'Explain it like I am 5. Break down complex topics simply.' },
                glossary: { label: 'Glossary', prompt: 'Extract technical terms and list their definitions.' },
                table: { label: 'Table', prompt: 'Try to find structured data in text and output as Markdown table.' },
            },
            buttons: {
                replace: 'Replace',
                append: 'Append'
            },
            confirmClearMessage: 'Are you sure you want to clear the entire history?',
            customPrompts: {
                add: 'New',
                delete: 'Delete',
                confirmDelete: 'Delete this prompt?',
                modalTitle: 'Add New Prompt',
                modalMessage: 'Format: Label|Prompt (e.g. "Translate|Translate this to English:")',
                addButton: 'Add',
                edit: 'Edit',
                modalTitleEdit: 'Edit Prompt'
            },
            privacyNotice: {
                searchActive: 'Web Search Active (Privacy Warning)',
                searchInactive: 'Local AI Mode (Private)',
                privacyWarning: 'External AI Model (Privacy Warning)',
                localMode: 'Local AI Mode'
            }
        },
        settings: {
            title: 'Settings',
            tabs: {
                general: 'General',
                llm: 'Chat (LLM)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Tools',

                account: 'Account',
                users: 'User Management',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'e.g. gpt-4 or llama3',
                baseUrlExample: 'e.g. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'e.g. Local TEI',
                embeddingModelExample: 'e.g. all-MiniLM-L6-v2',
                embeddingUrlExample: 'e.g. http://embeddings:8080',
                drawioUrlExample: 'e.g. /drawio',
                searxngUrlExample: 'e.g. http://searxng:8080'
            },
            account: {
                title: 'My Account',
                loggedInAs: 'Logged in as:',
                changePassword: 'Change Password',
                enterNewPassword: 'Enter your new password:',
                success: 'Password changed successfully',
                error: 'Password change failed'
            },
            tools: {
                title: 'Tools',
                drawio: {
                    title: 'Draw.io Integration',
                    provider: 'Provider',
                    cloud: 'Cloud (diagrams.net)',
                    local: 'Local (Self-hosted)',
                    localUrl: 'Local URL',
                    localUrlHelp: 'Default: /drawio (relative) or full URL.'
                },
                searxng: {
                    title: 'Web Search (SearXNG)',
                    adminManaged: 'Search settings are managed by the administrator.'
                },
                audio: {
                    title: 'Audio Transcription',
                    providerLabel: 'Transcription Provider',
                    addProvider: 'Add Audio Provider',
                    modelsTitle: 'Transcription Models',
                    providerHelp: 'Select the service used for speech-to-text conversion.'
                }
            },
            embeddings: {
                adminManaged: 'Embedding settings are managed by the administrator.',
                title: 'Embedding Settings (RAG)',
                providerLabel: 'Embedding Provider',
                providerHelp: 'Select the provider to use for vectorizing your notes.',
                selectModelPlaceholder: '-- Select Embedding Model --',
                modelsTitle: 'Embedding Models',
                addModel: 'Add Embedding Model'
            },
            llm: {
                adminManaged: 'LLM settings are managed by the administrator. You can view the configuration below.',
                chatModels: 'Chat Models',
                addModel: 'Add Model',
                deleteConfirm: 'Delete provider?'
            },
            info: {
                title: 'Information',
                appInfo: 'Application Information',
                appName: 'Application Name',
                license: 'License',
                copyright: 'Copyright',
                versions: 'Versions',
                frontendVersion: 'Frontend Version',
                backendVersion: 'Backend Version',
                buildDate: 'Build Date',
                systemInfo: 'System Information',
                nodeVersion: 'Node.js Version',
                databaseStatus: 'Database Status',
                serverUptime: 'Server Uptime',
                connected: 'Connected',
                disconnected: 'Disconnected',
                links: 'Links',
                repository: 'GitHub Repository',
                documentation: 'Documentation',
                loading: 'Loading...',
                error: 'Error loading system information'
            },
            labels: {
                language: 'Sprache / Language',
                provider: 'Provider Type',
                providerName: 'Provider Name',
                category: 'Category',
                categoryChat: 'Chat (Text Generation)',
                categoryEmbedding: 'Embedding (Vectorization)',
                typeCustom: 'Custom (OpenAI Compatible)',
                typeTransformers: 'Local Transformers (K8s)',
                model: 'Model Name',
                baseUrl: 'Base URL',
                apiKey: 'API Key',
                searxng: 'SearXNG URL (Optional)',
                searxngHelp: 'Enables web search for AI assistant.',
                addProvider: 'Add Provider',
                deleteProvider: 'Delete Provider',
                selectModel: 'Select Model',
                privacyMode: 'Privacy Mode',
                privacyLocal: 'Local (Private)',
                privacyExternal: 'External (Public/Cloud)',
                privacyWarning: 'External AI Model (Privacy Warning)',
                localMode: 'Local AI Mode',
                saveGlobal: 'Save Global Settings',
                active: 'Default',
                setDefault: 'Set Default'
            },

            userManagement: {
                title: 'User Management',
                addUser: 'Add User',
                publicRegistration: {
                    title: 'Public Registration',
                    description: 'If disabled, new users cannot register themselves. Administrators can still add users manually.'
                },
                table: {
                    username: 'Username',
                    role: 'Role',
                    created: 'Created',
                    actions: 'Actions',
                    you: '(You)',
                    loading: 'Loading users...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'User'
                },
                modals: {
                    create: {
                        title: 'Create User',
                        message: 'Enter the username for the new user:',
                        success: 'User created successfully',
                        error: 'Failed to create user'
                    },
                    password: {
                        title: 'Set Password',
                        messageName: 'Enter the password for {name}:',
                        resetTitle: 'Reset Password',
                        resetMessage: 'Enter a new password for {name}:',
                        success: 'Password updated'
                    },
                    delete: {
                        title: 'Delete User',
                        message: 'Are you sure you want to delete user "{name}"? This will delete all their notes.'
                    },
                    role: {
                        title: 'Change Role',
                        message: 'Change role of {name} to {role}?'
                    }
                }
            }
        }
    },
    fr: {
        trash: {
            title: 'Corbeille',
            emptyTrash: 'Vider la corbeille',
            restore: 'Restaurer',
            deletePermanently: 'Supprimer définitivement'
        },
        general: {
            loading: 'Chargement...',
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            edit: 'Éditer',
            create: 'Créer',
            close: 'Fermer',
            confirm: 'Confirmer',
            showExplorer: 'Afficher Explorateur',
            hideExplorer: 'Masquer Explorateur',
            showChat: 'Afficher Chat',
            hideChat: 'Masquer Chat',
            lightMode: 'Mode Clair',
            darkMode: 'Mode Sombre',
            logout: 'Se déconnecter'
        },
        sidebar: {
            explorer: 'EXPLORATEUR',
            newNote: 'Nouvelle Note',
            newFolder: 'Nouveau Dossier',
            rename: 'Renommer',
            delete: 'Supprimer',
            duplicate: 'Dupliquer',
            searchPlaceholder: 'Chercher des notes...',
            quickNote: 'Note Rapide',
        },
        editor: {
            placeholder: 'Commencez à écrire...',
            saving: 'Enregistrement...',
            saved: 'Enregistré',
            error: 'Erreur',
            saveNow: 'Enregistrer maintenant',
            noSelection: 'Sélectionnez une note pour l\'éditer',
            autoSave: 'Enregistrement auto',
            emptyState: 'Sélectionnez une note pour l\'éditer',
            history: 'Historique',
            restore: 'Restaurer',
            version: 'Version',
            restoreConfirm: 'Revenir à cette version ? Les modifications actuelles seront perdues.',
            current: 'Actuel',
            noVersions: 'Aucune version précédente disponible.',
            insertDiagram: 'Insérer un diagramme',
            words: 'Mots',
            chars: 'Caractères'
        },
        audio: {
            title: 'Enregistrement Audio',
            recording: 'Enregistrement...',
            processing: 'Traitement...',
            loading: 'En attente du modèle IA...',
            clickToRecord: 'Cliquez pour enregistrer',
            clickToStop: 'Cliquez pour arrêter',
            tapToStart: 'Appuyez pour commencer',
            sending: 'Envoi à Whisper...',
            loadingMessage: 'Chargement du modèle...',
            coldStart: 'Le premier démarrage peut prendre 30s'
        },
        chat: {
            title: 'Assistant IA',
            placeholder: 'Demandez à l\'IA...',
            clearHistory: 'Effacer l\'historique',
            emptyState: 'Demandez-moi n\'importe quoi sur vos notes !',
            thinking: 'L\'IA réfléchit...',
            actions: {
                summarize: { label: 'Résumer', prompt: 'Résume cette note' },
                rewrite: { label: 'Réécrire', prompt: 'Réécris cette note pour qu\'elle soit plus compréhensible' },
                structure: { label: 'Structure', prompt: 'Suggère une structure/plan pour cette note' },
                keyPoints: { label: 'Points Clés', prompt: 'Génère 5 points clés' },
                spelling: { label: 'Orthographe', prompt: 'Corrige l\'orthographe et la grammaire de ce texte. Conserve le contenu.' },
                eli5: { label: 'ELI5', prompt: 'Explique-moi comme si j\'avais 5 ans. Simplifie les sujets complexes.' },
                glossary: { label: 'Glossaire', prompt: 'Extrais les termes techniques et liste leurs définitions.' },
                table: { label: 'Tableau', prompt: 'Essaie de trouver des données structurées dans le texte et affiche-les sous forme de tableau Markdown.' },
            },
            buttons: {
                replace: 'Remplacer',
                append: 'Ajouter'
            },
            confirmClearMessage: 'Êtes-vous sûr de vouloir effacer tout l\'historique ?',
            customPrompts: {
                add: 'Nouveau',
                delete: 'Supprimer',
                confirmDelete: 'Supprimer ce prompt ?',
                modalTitle: 'Ajouter un nouveau prompt',
                modalMessage: 'Format: Étiquette|Prompt (ex: "Traduire|Traduis ceci en anglais:")',
                addButton: 'Ajouter',
                edit: 'Éditer',
                modalTitleEdit: 'Modifier Prompt'
            },
            privacyNotice: {
                searchActive: 'Recherche Web Active (Attention)',
                searchInactive: 'Mode IA Local (Privé)',
                privacyWarning: 'Modèle IA Externe (Attention)',
                localMode: 'Mode IA Local'
            }
        },
        settings: {
            title: 'Paramètres',
            tabs: {
                general: 'Général',
                llm: 'LLM (Chat)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Outils',

                account: 'Compte',
                users: 'Gestion Utilisateurs',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'ex. gpt-4 ou llama3',
                baseUrlExample: 'ex. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'ex. TEI Local',
                embeddingModelExample: 'ex. all-MiniLM-L6-v2',
                embeddingUrlExample: 'ex. http://embeddings:8080',
                drawioUrlExample: 'ex. /drawio',
                searxngUrlExample: 'ex. http://searxng:8080'
            },
            account: {
                title: 'Mon Compte',
                loggedInAs: 'Connecté en tant que:',
                changePassword: 'Changer le mot de passe',
                enterNewPassword: 'Entrez votre nouveau mot de passe:',
                success: 'Mot de passe changé avec succès',
                error: 'Échec du changement de mot de passe'
            },
            tools: {
                title: 'Outils',
                drawio: {
                    title: 'Intégration Draw.io',
                    provider: 'Fournisseur',
                    cloud: 'Cloud (diagrams.net)',
                    local: 'Local (Auto-hébergé)',
                    localUrl: 'URL Locale',
                    localUrlHelp: 'Défaut: /drawio (relatif) ou URL complète.'
                },
                searxng: {
                    title: 'Recherche Web (SearXNG)',
                    adminManaged: 'Les paramètres de recherche sont gérés par l\'administrateur.'
                },
                audio: {
                    title: 'Transcription Audio',
                    providerLabel: 'Fournisseur de Transcription',
                    addProvider: 'Ajouter Fournisseur Audio',
                    modelsTitle: 'Modèles de Transcription',
                    providerHelp: 'Sélectionnez le service utilisé pour la conversion parole-texte.'
                }
            },
            embeddings: {
                adminManaged: 'Les paramètres d\'embedding sont gérés par l\'administrateur.',
                title: 'Paramètres Embeddings (RAG)',
                providerLabel: 'Fournisseur d\'Embedding',
                providerHelp: 'Choisissez le fournisseur à utiliser pour vectoriser vos notes.',
                selectModelPlaceholder: '-- Choisir Modèle Embedding --',
                modelsTitle: 'Modèles d\'Embedding',
                addModel: 'Ajouter Modèle Embedding'
            },
            llm: {
                adminManaged: 'Les paramètres LLM sont gérés par l\'administrateur. Vous pouvez voir la configuration ci-dessous.',
                chatModels: 'Modèles de Chat',
                addModel: 'Ajouter Modèle',
                deleteConfirm: 'Supprimer le fournisseur ?'
            },
            info: {
                title: 'Informations',
                appInfo: 'Informations sur l’application',
                appName: 'Nom de l’application',
                license: 'Licence',
                copyright: 'Droits d’auteur',
                versions: 'Versions',
                frontendVersion: 'Version Frontend',
                backendVersion: 'Version Backend',
                buildDate: 'Date de compilation',
                systemInfo: 'Informations système',
                nodeVersion: 'Version Node.js',
                databaseStatus: 'Statut de la base de données',
                serverUptime: 'Temps de fonctionnement',
                connected: 'Connecté',
                disconnected: 'Déconnecté',
                links: 'Liens',
                repository: 'Dépôt GitHub',
                documentation: 'Documentation',
                loading: 'Chargement...',
                error: 'Erreur lors du chargement des informations système'
            },
            labels: {
                language: 'Langue / Language',
                provider: 'Type de fournisseur',
                providerName: 'Nom du Fournisseur',
                category: 'Catégorie',
                categoryChat: 'Chat (Génération de Texte)',
                categoryEmbedding: 'Embedding (Vectorisation)',
                typeCustom: 'Personnalisé (Compatible OpenAI)',
                typeTransformers: 'Transformers Locaux (K8s)',
                model: 'Nom du modèle',
                baseUrl: 'URL de base',
                apiKey: 'Clé API',
                searxng: 'URL SearXNG (Optionnel)',
                searxngHelp: 'Active la recherche web pour l\'assistant IA.',
                addProvider: 'Ajouter un fournisseur',
                deleteProvider: 'Supprimer le fournisseur',
                selectModel: 'Sélectionner le modèle',
                privacyMode: 'Mode Confidentialité',
                privacyLocal: 'Local (Privé)',
                privacyExternal: 'Externe (Public/Cloud)',
                privacyWarning: 'Modèle IA Externe (Attention)',
                localMode: 'Mode IA Local',
                saveGlobal: 'Enregistrer les paramètres globaux',
                active: 'Par défaut',
                setDefault: 'Définir par défaut'
            },

            userManagement: {
                title: 'Gestion des Utilisateurs',
                addUser: 'Ajouter un utilisateur',
                publicRegistration: {
                    title: 'Inscription Publique',
                    description: 'Si désactivé, les nouveaux utilisateurs ne peuvent pas s\'inscrire eux-mêmes. Les administrateurs peuvent toujours ajouter des utilisateurs.'
                },
                table: {
                    username: 'Nom d\'utilisateur',
                    role: 'Rôle',
                    created: 'Créé',
                    actions: 'Actions',
                    you: '(Vous)',
                    loading: 'Chargement des utilisateurs...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'Utilisateur'
                },
                modals: {
                    create: {
                        title: 'Créer un utilisateur',
                        message: 'Entrez le nom d\'utilisateur pour le nouvel utilisateur:',
                        success: 'Utilisateur créé avec succès',
                        error: 'Échec de la création de l\'utilisateur'
                    },
                    password: {
                        title: 'Définir le mot de passe',
                        messageName: 'Entrez le mot de passe pour {name}:',
                        resetTitle: 'Réinitialiser le mot de passe',
                        resetMessage: 'Entrez un nouveau mot de passe pour {name}:',
                        success: 'Mot de passe mis à jour'
                    },
                    delete: {
                        title: 'Supprimer l\'utilisateur',
                        message: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur "{name}" ? Cela supprimera toutes ses notes.'
                    },
                    role: {
                        title: 'Changer le rôle',
                        message: 'Changer le rôle de {name} en {role}?'
                    }
                }
            }
        }
    },
    it: {
        trash: {
            title: 'Cestino',
            emptyTrash: 'Svuota cestino',
            restore: 'Ripristina',
            deletePermanently: 'Elimina definitivamente'
        },
        general: {
            loading: 'Caricamento...',
            save: 'Salva',
            cancel: 'Annulla',
            delete: 'Elimina',
            edit: 'Modifica',
            create: 'Crea',
            close: 'Chiudi',
            confirm: 'Conferma',
            showExplorer: 'Mostra Esplora Risorse',
            hideExplorer: 'Nascondi Esplora Risorse',
            showChat: 'Mostra Chat',
            hideChat: 'Nascondi Chat',
            lightMode: 'Modalità Chiara',
            darkMode: 'Modalità Scura',
            logout: 'Disconnettersi'
        },
        sidebar: {
            explorer: 'ESPLORA RISORSE',
            newNote: 'Nuova Nota',
            newFolder: 'Nuova Cartella',
            rename: 'Rinomina',
            delete: 'Elimina',
            duplicate: 'Duplica',
            searchPlaceholder: 'Cerca note...',
            quickNote: 'Nota Rapida',
        },
        editor: {
            placeholder: 'Inizia a scrivere...',
            saving: 'Salvataggio...',
            saved: 'Salvato',
            error: 'Errore',
            saveNow: 'Salva Ora',
            noSelection: 'Seleziona una nota da modificare',
            autoSave: 'Salvataggio automatico',
            emptyState: 'Seleziona una nota da modificare',
            history: 'Cronologia',
            restore: 'Ripristina',
            version: 'Versione',
            restoreConfirm: 'Ripristinare questa versione? Le modifiche attuali andranno perse.',
            current: 'Attuale',
            noVersions: 'Nessuna versione precedente disponibile.',
            insertDiagram: 'Inserisci Diagramma',
            words: 'Parole',
            chars: 'Caratteri'
        },
        audio: {
            title: 'Registrazione Audio',
            recording: 'Registrazione...',
            processing: 'Elaborazione...',
            loading: 'In attesa del modello IA...',
            clickToRecord: 'Clicca per registrare',
            clickToStop: 'Clicca per fermare',
            tapToStart: 'Tocca per iniziare',
            sending: 'Invio a Whisper...',
            loadingMessage: 'Caricamento modello...',
            coldStart: 'Il primo avvio può richiedere 30s'
        },
        chat: {
            title: 'Assistente AI',
            placeholder: 'Chiedi all\'AI...',
            clearHistory: 'Cancella cronologia chat',
            emptyState: 'Chiedimi qualsiasi cosa sulle tue note!',
            thinking: 'L\'AI sta pensando...',
            actions: {
                summarize: { label: 'Riassumi', prompt: 'Riassumi questa nota' },
                rewrite: { label: 'Riscrivi', prompt: 'Riscrivi questa nota per renderla più comprensibile' },
                structure: { label: 'Struttura', prompt: 'Suggerisci una struttura/schema per questa nota' },
                keyPoints: { label: 'Punti Chiave', prompt: 'Genera 5 punti chiave' },
                spelling: { label: 'Ortografia', prompt: 'Correggi l\'ortografia e la grammatica. Mantieni il contenuto.' },
                eli5: { label: 'ELI5', prompt: 'Spiegamelo come se avessi 5 anni. Semplifica argomenti complessi.' },
                glossary: { label: 'Glossario', prompt: 'Estrai termini tecnici ed elenca le loro definizioni.' },
                table: { label: 'Tabella', prompt: 'Prova a trovare dati strutturati nel testo e visualizzali come tabella Markdown.' },
            },
            buttons: {
                replace: 'Sostituisci',
                append: 'Aggiungi'
            },
            confirmClearMessage: 'Sei sicuro di voler cancellare l\'intera cronologia?',
            customPrompts: {
                add: 'Nuovo',
                delete: 'Elimina',
                confirmDelete: 'Eliminare questo prompt?',
                modalTitle: 'Aggiungi Nuovo Prompt',
                modalMessage: 'Formato: Etichetta|Prompt (es. "Traduci|Traduci questo in inglese:")',
                addButton: 'Aggiungi',
                edit: 'Modifica',
                modalTitleEdit: 'Modifica Prompt'
            },
            privacyNotice: {
                searchActive: 'Ricerca Web Attiva (Attenzione)',
                searchInactive: 'Modalità AI Locale (Privato)',
                privacyWarning: 'Modello AI Esterno (Attenzione)',
                localMode: 'Modalità AI Locale'
            }
        },
        settings: {
            title: 'Impostazioni',
            tabs: {
                general: 'Generale',
                llm: 'LLM (Chat)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Strumenti',

                account: 'Account',
                users: 'Gestione Utenti',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'es. gpt-4 o llama3',
                baseUrlExample: 'es. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'es. TEI Locale',
                embeddingModelExample: 'es. all-MiniLM-L6-v2',
                embeddingUrlExample: 'es. http://embeddings:8080',
                drawioUrlExample: 'es. /drawio',
                searxngUrlExample: 'es. http://searxng:8080'
            },
            account: {
                title: 'Il Mio Account',
                loggedInAs: 'Accesso come:',
                changePassword: 'Cambia Password',
                enterNewPassword: 'Inserisci la nuova password:',
                success: 'Password cambiata con successo',
                error: 'Cambio password fallito'
            },
            tools: {
                title: 'Strumenti',
                drawio: {
                    title: 'Integrazione Draw.io',
                    provider: 'Provider',
                    cloud: 'Cloud (diagrams.net)',
                    local: 'Locale (Self-hosted)',
                    localUrl: 'URL Locale',
                    localUrlHelp: 'Default: /drawio (relativo) o URL completo.'
                },
                searxng: {
                    title: 'Ricerca Web (SearXNG)',
                    adminManaged: 'Le impostazioni di ricerca sono gestite dall\'amministratore.'
                },
                audio: {
                    title: 'Trascrizione Audio',
                    providerLabel: 'Provider Trascrizione',
                    addProvider: 'Aggiungi Provider Audio',
                    modelsTitle: 'Modelli di Trascrizione',
                    providerHelp: 'Seleziona il servizio utilizzato per la conversione voce-testo.'
                }
            },
            embeddings: {
                adminManaged: 'Le impostazioni di embedding sono gestite dall\'amministratore.',
                title: 'Impostazioni Embedding (RAG)',
                providerLabel: 'Provider Embedding',
                providerHelp: 'Seleziona il provider da utilizzare per vettorializzare le tue note.',
                selectModelPlaceholder: '-- Seleziona Modello Embedding --',
                modelsTitle: 'Modelli Embedding',
                addModel: 'Aggiungi Modello Embedding'
            },
            llm: {
                adminManaged: 'Le impostazioni LLM sono gestite dall\'amministratore. Puoi visualizzare la configurazione qui sotto.',
                chatModels: 'Modelli Chat',
                addModel: 'Aggiungi Modello',
                deleteConfirm: 'Eliminare il provider?'
            },
            info: {
                title: 'Informazioni',
                appInfo: 'Informazioni Applicazione',
                appName: 'Nome Applicazione',
                license: 'Licenza',
                copyright: 'Copyright',
                versions: 'Versioni',
                frontendVersion: 'Versione Frontend',
                backendVersion: 'Versione Backend',
                buildDate: 'Data di Compilazione',
                systemInfo: 'Informazioni Sistema',
                nodeVersion: 'Versione Node.js',
                databaseStatus: 'Stato Database',
                serverUptime: 'Tempo Attivo Server',
                connected: 'Connesso',
                disconnected: 'Disconnesso',
                links: 'Collegamenti',
                repository: 'Repository GitHub',
                documentation: 'Documentazione',
                loading: 'Caricamento...',
                error: 'Errore nel caricamento delle informazioni di sistema'
            },
            labels: {
                language: 'Lingua / Language',
                provider: 'Tipo di Provider',
                providerName: 'Nome Provider',
                category: 'Categoria',
                categoryChat: 'Chat (Generazione Testo)',
                categoryEmbedding: 'Embedding (Vettorializzazione)',
                typeCustom: 'Personalizzato (Compatibile OpenAI)',
                typeTransformers: 'Transformers Locali (K8s)',
                model: 'Nome del Modello',
                baseUrl: 'URL Base',
                apiKey: 'Chiave API',
                searxng: 'URL SearXNG (Opzionale)',
                searxngHelp: 'Abilita la ricerca web per l\'assistente AI.',
                addProvider: 'Aggiungi Provider',
                deleteProvider: 'Elimina Provider',
                selectModel: 'Seleziona Modello',
                privacyMode: 'Modalità Privacy',
                privacyLocal: 'Locale (Privato)',
                privacyExternal: 'Esterno (Pubblico/Cloud)',
                privacyWarning: 'Modello AI Esterno (Attenzione)',
                localMode: 'Modalità AI Locale',
                saveGlobal: 'Salva Impostazioni Globali',
                active: 'Predefinito',
                setDefault: 'Imposta Predefinito'
            },

            userManagement: {
                title: 'Gestione Utenti',
                addUser: 'Aggiungi Utente',
                publicRegistration: {
                    title: 'Registrazione Pubblica',
                    description: 'Se disabilitato, i nuovi utenti non possono registrarsi autonomamente. Gli amministratori possono comunque aggiungere utenti.'
                },
                table: {
                    username: 'Nome Utente',
                    role: 'Ruolo',
                    created: 'Creato il',
                    actions: 'Azioni',
                    you: '(Tu)',
                    loading: 'Caricamento utenti...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'Utente'
                },
                modals: {
                    create: {
                        title: 'Crea Utente',
                        message: 'Inserisci il nome utente per il nuovo utente:',
                        success: 'Utente creato con successo',
                        error: 'Creazione utente fallita'
                    },
                    password: {
                        title: 'Imposta Password',
                        messageName: 'Inserisci la password per {name}:',
                        resetTitle: 'Reimposta Password',
                        resetMessage: 'Inserisci una nuova password per {name}:',
                        success: 'Password aggiornata'
                    },
                    delete: {
                        title: 'Elimina Utente',
                        message: 'Sei sicuro di voler eliminare l\'utente "{name}"? Questo eliminerà tutte le sue note.'
                    },
                    role: {
                        title: 'Cambia Ruolo',
                        message: 'Cambiare il ruolo di {name} in {role}?'
                    }
                }
            }
        }
    },
    es: {
        trash: {
            title: 'Papelera',
            emptyTrash: 'Vaciar papelera',
            restore: 'Restaurar',
            deletePermanently: 'Eliminar permanentemente'
        },
        general: {
            loading: 'Cargando...',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            create: 'Crear',
            close: 'Cerrar',
            confirm: 'Confirmar',
            showExplorer: 'Mostrar Explorador',
            hideExplorer: 'Ocultar Explorador',
            showChat: 'Mostrar Chat',
            hideChat: 'Ocultar Chat',
            lightMode: 'Modo Claro',
            darkMode: 'Modo Oscuro',
            logout: 'Cerrar Sesión'
        },
        sidebar: {
            explorer: 'EXPLORADOR',
            newNote: 'Nueva Nota',
            newFolder: 'Nueva Carpeta',
            rename: 'Renombrar',
            delete: 'Eliminar',
            duplicate: 'Duplicar',
            searchPlaceholder: 'Buscar notas...',
            quickNote: 'Nota Rápida',
        },
        editor: {
            placeholder: 'Empieza a escribir...',
            saving: 'Guardando...',
            saved: 'Guardado',
            error: 'Error',
            saveNow: 'Guardar Ahora',
            noSelection: 'Selecciona una nota para editar',
            autoSave: 'Autoguardado',
            emptyState: 'Selecciona una nota para editar',
            history: 'Historial',
            restore: 'Restaurar',
            version: 'Versión',
            restoreConfirm: '¿Revertir a esta versión? Se perderán los cambios actuales.',
            current: 'Actual',
            noVersions: 'No hay versiones anteriores disponibles.',
            insertDiagram: 'Insertar Diagrama',
            words: 'Palabras',
            chars: 'Caracteres'
        },
        audio: {
            title: 'Grabación de Audio',
            recording: 'Grabando...',
            processing: 'Procesando...',
            loading: 'Esperando al modelo IA...',
            clickToRecord: 'Clic para grabar',
            clickToStop: 'Clic para detener',
            tapToStart: 'Toca para iniciar',
            sending: 'Enviando a Whisper...',
            loadingMessage: 'Cargando modelo...',
            coldStart: 'El primer inicio puede tardar 30s'
        },
        chat: {
            title: 'Asistente IA',
            placeholder: 'Pregunta a la IA...',
            clearHistory: 'Borrar historial',
            emptyState: '¡Pregúntame cualquier cosa sobre tus notas!',
            thinking: 'La IA está pensando...',
            actions: {
                summarize: { label: 'Resumir', prompt: 'Resume esta nota' },
                rewrite: { label: 'Reescribir', prompt: 'Reescribe esta nota para que sea más comprensible' },
                structure: { label: 'Estructura', prompt: 'Sugiere una estructura/esquema para esta nota' },
                keyPoints: { label: 'Puntos Clave', prompt: 'Genera 5 puntos clave' },
                spelling: { label: 'Ortografía', prompt: 'Corrige la ortografía y la gramática. Mantén el contenido.' },
                eli5: { label: 'ELI5', prompt: 'Explícamelo como si tuviera 5 años. Simplifica temas complejos.' },
                glossary: { label: 'Glosario', prompt: 'Extrae términos técnicos y lista sus definiciones.' },
                table: { label: 'Tabla', prompt: 'Intenta encontrar datos estructurados en el texto y muéstralos como una tabla Markdown.' },
            },
            buttons: {
                replace: 'Reemplazar',
                append: 'Adjuntar'
            },
            confirmClearMessage: '¿Estás seguro de que quieres borrar todo el historial?',
            customPrompts: {
                add: 'Nuevo',
                delete: 'Eliminar',
                confirmDelete: '¿Eliminar este prompt?',
                modalTitle: 'Añadir Nuevo Prompt',
                modalMessage: 'Formato: Etiqueta|Prompt (ej. "Traducir|Traduce esto al inglés:")',
                addButton: 'Añadir',
                edit: 'Editar',
                modalTitleEdit: 'Editar Prompt'
            },
            privacyNotice: {
                searchActive: 'Búsqueda Web Activa (Advertencia)',
                searchInactive: 'Modo IA Local (Privado)',
                privacyWarning: 'Modelo IA Externo (Advertencia)',
                localMode: 'Modo IA Local'
            }
        },
        settings: {
            title: 'Configuración',
            tabs: {
                general: 'General',
                llm: 'LLM (Chat)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Herramientas',

                account: 'Cuenta',
                users: 'Gestión de Usuarios',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'ej. gpt-4 o llama3',
                baseUrlExample: 'ej. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'ej. TEI Local',
                embeddingModelExample: 'ej. all-MiniLM-L6-v2',
                embeddingUrlExample: 'ej. http://embeddings:8080',
                drawioUrlExample: 'ej. /drawio',
                searxngUrlExample: 'ej. http://searxng:8080'
            },
            account: {
                title: 'Mi Cuenta',
                loggedInAs: 'Iniciado como:',
                changePassword: 'Cambiar Contraseña',
                enterNewPassword: 'Introduce tu nueva contraseña:',
                success: 'Contraseña cambiada con éxito',
                error: 'Fallo al cambiar la contraseña'
            },
            tools: {
                title: 'Herramientas',
                drawio: {
                    title: 'Integración Draw.io',
                    provider: 'Proveedor',
                    cloud: 'Nube (diagrams.net)',
                    local: 'Local (Self-hosted)',
                    localUrl: 'URL Local',
                    localUrlHelp: 'Por defecto: /drawio (relativo) o URL completa.'
                },
                searxng: {
                    title: 'Búsqueda Web (SearXNG)',
                    adminManaged: 'La configuración de búsqueda es gestionada por el administrador.'
                },
                audio: {
                    title: 'Transcripción de Audio',
                    providerLabel: 'Proveedor de Transcripción',
                    addProvider: 'Añadir Proveedor de Audio',
                    modelsTitle: 'Modelos de Transcripción',
                    providerHelp: 'Seleccione el servicio utilizado para la conversión de voz a texto.'
                }
            },
            embeddings: {
                adminManaged: 'La configuración de embedding es gestionada por el administrador.',
                title: 'Configuración de Embedding (RAG)',
                providerLabel: 'Proveedor de Embedding',
                providerHelp: 'Selecciona el proveedor para vectorizar tus notas.',
                selectModelPlaceholder: '-- Seleccionar Modelo Embedding --',
                modelsTitle: 'Modelos de Embedding',
                addModel: 'Añadir Modelo Embedding'
            },
            llm: {
                adminManaged: 'La configuración LLM es gestionada por el administrador. Puedes ver la configuración abajo.',
                chatModels: 'Modelos de Chat',
                addModel: 'Añadir Modelo',
                deleteConfirm: '¿Eliminar proveedor?'
            },
            info: {
                title: 'Información',
                appInfo: 'Información de la aplicación',
                appName: 'Nombre de la aplicación',
                license: 'Licencia',
                copyright: 'Derechos de autor',
                versions: 'Versiones',
                frontendVersion: 'Versión Frontend',
                backendVersion: 'Versión Backend',
                buildDate: 'Fecha de compilación',
                systemInfo: 'Información del sistema',
                nodeVersion: 'Versión Node.js',
                databaseStatus: 'Estado de la base de datos',
                serverUptime: 'Tiempo de actividad del servidor',
                connected: 'Conectado',
                disconnected: 'Desconectado',
                links: 'Enlaces',
                repository: 'Repositorio GitHub',
                documentation: 'Documentación',
                loading: 'Cargando...',
                error: 'Error al cargar la información del sistema'
            },
            labels: {
                language: 'Idioma / Language',
                provider: 'Tipo de Proveedor',
                providerName: 'Nombre del Proveedor',
                category: 'Categoría',
                categoryChat: 'Chat (Generación de Texto)',
                categoryEmbedding: 'Embedding (Vectorización)',
                typeCustom: 'Personalizado (Compatible OpenAI)',
                typeTransformers: 'Transformers Locales (K8s)',
                model: 'Nombre del Modelo',
                baseUrl: 'URL Base',
                apiKey: 'Clave API',
                searxng: 'URL SearXNG (Opcional)',
                searxngHelp: 'Habilita la búsqueda web para el asistente IA.',
                addProvider: 'Añadir Proveedor',
                deleteProvider: 'Eliminar Proveedor',
                selectModel: 'Seleccionar Modelo',
                privacyMode: 'Modo Privacidad',
                privacyLocal: 'Local (Privado)',
                privacyExternal: 'Externo (Público/Cloud)',
                privacyWarning: 'Modelo IA Externo (Advertencia)',
                localMode: 'Modo IA Local',
                saveGlobal: 'Guardar Configuración Global',
                active: 'Predeterminado',
                setDefault: 'Establecer Predeterminado'
            },

            userManagement: {
                title: 'Gestión de Usuarios',
                addUser: 'Añadir Usuario',
                publicRegistration: {
                    title: 'Registro Público',
                    description: 'Si está desactivado, los nuevos usuarios no pueden registrarse ellos mismos. Los administradores aún pueden añadir usuarios.'
                },
                table: {
                    username: 'Usuario',
                    role: 'Rol',
                    created: 'Creado',
                    actions: 'Acciones',
                    you: '(Tú)',
                    loading: 'Cargando usuarios...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'Usuario'
                },
                modals: {
                    create: {
                        title: 'Crear Usuario',
                        message: 'Introduce el nombre de usuario para el nuevo usuario:',
                        success: 'Usuario creado con éxito',
                        error: 'Fallo al crear usuario'
                    },
                    password: {
                        title: 'Establecer Contraseña',
                        messageName: 'Introduce la contraseña para {name}:',
                        resetTitle: 'Restablecer Contraseña',
                        resetMessage: 'Introduce una nueva contraseña para {name}:',
                        success: 'Contraseña actualizada'
                    },
                    delete: {
                        title: 'Eliminar Usuario',
                        message: '¿Seguro que quieres eliminar al usuario "{name}"? Esto borrará todas sus notas.'
                    },
                    role: {
                        title: 'Cambiar Rol',
                        message: '¿Cambiar el rol de {name} a {role}?'
                    }
                }
            }
        }
    },
    nl: {
        trash: {
            title: 'Prullenbak',
            emptyTrash: 'Prullenbak legen',
            restore: 'Herstellen',
            deletePermanently: 'Definitief verwijderen'
        },
        general: {
            loading: 'Laden...',
            save: 'Opslaan',
            cancel: 'Annuleren',
            delete: 'Verwijderen',
            edit: 'Bewerken',
            create: 'Maken',
            close: 'Sluiten',
            confirm: 'Bevestigen',
            showExplorer: 'Verkenner tonen',
            hideExplorer: 'Verkenner verbergen',
            showChat: 'Chat tonen',
            hideChat: 'Chat verbergen',
            lightMode: 'Lichte modus',
            darkMode: 'Donkere modus',
            logout: 'Uitloggen'
        },
        sidebar: {
            explorer: 'VERKENNER',
            newNote: 'Nieuwe notitie',
            newFolder: 'Nieuwe map',
            rename: 'Hernoemen',
            delete: 'Verwijderen',
            duplicate: 'Dupliceren',
            searchPlaceholder: 'Notities zoeken...',
            quickNote: 'Snelle Notitie',
        },
        editor: {
            placeholder: 'Begin met schrijven...',
            saving: 'Opslaan...',
            saved: 'Opgeslagen',
            error: 'Fout',
            saveNow: 'Nu opslaan',
            noSelection: 'Selecteer een notitie om te bewerken',
            autoSave: 'Automatisch opslaan',
            emptyState: 'Selecteer een notitie om te bewerken',
            history: 'Geschiedenis',
            restore: 'Herstellen',
            version: 'Versie',
            restoreConfirm: 'Herstellen naar deze versie? Huidige wijzigingen gaan verloren.',
            current: 'Huidig',
            noVersions: 'Geen eerdere versies beschikbaar.',
            insertDiagram: 'Diagram invoegen',
            words: 'Woorden',
            chars: 'Tekens'
        },
        audio: {
            title: 'Audio Opname',
            recording: 'Opnemen...',
            processing: 'Verwerken...',
            loading: 'Wachten op AI-model...',
            clickToRecord: 'Klik om op te nemen',
            clickToStop: 'Klik om te stoppen',
            tapToStart: 'Tik om te starten',
            sending: 'Verzenden naar Whisper...',
            loadingMessage: 'Model wordt geladen...',
            coldStart: 'Eerste start kan 30s duren'
        },
        chat: {
            title: 'AI Assistent',
            placeholder: 'Vraag AI...',
            clearHistory: 'Chatgeschiedenis wissen',
            emptyState: 'Vraag me alles over je notities!',
            thinking: 'AI denkt na...',
            actions: {
                summarize: { label: 'Samenvatten', prompt: 'Vat deze notitie samen' },
                rewrite: { label: 'Herschrijven', prompt: 'Herschrijf deze notitie om het begrijpelijker te maken' },
                structure: { label: 'Structuur', prompt: 'Stel een structuur/indeling voor deze notitie voor' },
                keyPoints: { label: 'Belangrijkste punten', prompt: 'Genereer 5 belangrijke punten' },
                spelling: { label: 'Spelling', prompt: 'Corrigeer de spelling en grammatica van deze tekst. Behoud de inhoud.' },
                eli5: { label: 'Jip en Janneke', prompt: 'Leg het uit alsof ik 5 ben. Breek complexe onderwerpen simpel af.' },
                glossary: { label: 'Woordenlijst', prompt: 'Extraheer technische termen en geef hun definities.' },
                table: { label: 'Tabel', prompt: 'Probeer gestructureerde gegevens in de tekst te vinden en geef deze weer als Markdown-tabel.' },
            },
            buttons: {
                replace: 'Vervangen',
                append: 'Toevoegen'
            },
            confirmClearMessage: 'Weet je zeker dat je de volledige geschiedenis wilt wissen?',
            customPrompts: {
                add: 'Nieuw',
                delete: 'Verwijderen',
                confirmDelete: 'Deze prompt verwijderen?',
                modalTitle: 'Nieuwe prompt toevoegen',
                modalMessage: 'Formaat: Label|Prompt (bijv. "Vertalen|Vertaal dit naar het Engels:")',
                addButton: 'Toevoegen',
                edit: 'Bewerken',
                modalTitleEdit: 'Prompt bewerken'
            },
            privacyNotice: {
                searchActive: 'Webzoeken actief (Waarschuwing)',
                searchInactive: 'Lokale AI-modus (Privé)',
                privacyWarning: 'Extern AI Model (Privacy Waarschuwing)',
                localMode: 'Lokale AI-modus'
            }
        },
        settings: {
            title: 'Instellingen',
            tabs: {
                general: 'Algemeen',
                llm: 'LLM (Chat)',
                embeddings: 'Embeddings (RAG)',
                tools: 'Gereedschap',

                account: 'Account',
                users: 'Gebruikersbeheer',
                info: 'Info'
            },
            placeholders: {
                modelExample: 'bijv. gpt-4 of llama3',
                baseUrlExample: 'bijv. https://api.openai.com/v1',
                apiKeyExample: 'sk-...',
                embeddingProviderExample: 'bijv. Lokale TEI',
                embeddingModelExample: 'bijv. all-MiniLM-L6-v2',
                embeddingUrlExample: 'bijv. http://embeddings:8080',
                drawioUrlExample: 'bijv. /drawio',
                searxngUrlExample: 'bijv. http://searxng:8080'
            },
            account: {
                title: 'Mijn Account',
                loggedInAs: 'Ingelogd als:',
                changePassword: 'Wachtwoord wijzigen',
                enterNewPassword: 'Voer je nieuwe wachtwoord in:',
                success: 'Wachtwoord succesvol gewijzigd',
                error: 'Wachtwoord wijzigen mislukt'
            },
            tools: {
                title: 'Gereedschap',
                drawio: {
                    title: 'Draw.io Integratie',
                    provider: 'Provider',
                    cloud: 'Cloud (diagrams.net)',
                    local: 'Lokaal (Self-hosted)',
                    localUrl: 'Lokale URL',
                    localUrlHelp: 'Standaard: /drawio (relatief) of volledige URL.'
                },
                searxng: {
                    title: 'Webzoeken (SearXNG)',
                    adminManaged: 'Zoekinstellingen worden beheerd door de beheerder.'
                },
                audio: {
                    title: 'Audio Transcriptie',
                    providerLabel: 'Transcriptie Provider',
                    addProvider: 'Audio Provider Toevoegen',
                    modelsTitle: 'Transcriptie Modellen',
                    providerHelp: 'Selecteer de service die wordt gebruikt voor spraak-naar-tekstconversie.'
                }
            },
            embeddings: {
                adminManaged: 'Embedding-instellingen worden beheerd door de beheerder.',
                title: 'Embedding Instellingen (RAG)',
                providerLabel: 'Embedding Provider',
                providerHelp: 'Selecteer de provider voor het vectoriseren van je notities.',
                selectModelPlaceholder: '-- Selecteer Embedding Model --',
                modelsTitle: 'Embedding Modellen',
                addModel: 'Embedding Model toevoegen'
            },
            llm: {
                adminManaged: 'LLM-instellingen worden beheerd door de beheerder. Je kunt de configuratie hieronder bekijken.',
                chatModels: 'Chat Modellen',
                addModel: 'Model toevoegen',
                deleteConfirm: 'Provider verwijderen?'
            },
            info: {
                title: 'Informatie',
                appInfo: 'Applicatie Informatie',
                appName: 'Applicatienaam',
                license: 'Licentie',
                copyright: 'Auteursrecht',
                versions: 'Versies',
                frontendVersion: 'Frontend Versie',
                backendVersion: 'Backend Versie',
                buildDate: 'Bouwdatum',
                systemInfo: 'Systeeminformatie',
                nodeVersion: 'Node.js Versie',
                databaseStatus: 'Databasestatus',
                serverUptime: 'Server Uptime',
                connected: 'Verbonden',
                disconnected: 'Niet verbonden',
                links: 'Links',
                repository: 'GitHub Repository',
                documentation: 'Documentatie',
                loading: 'Laden...',
                error: 'Fout bij het laden van systeeminformatie'
            },
            labels: {
                language: 'Taal / Language',
                provider: 'Provider Type',
                providerName: 'Provider Naam',
                category: 'Categorie',
                categoryChat: 'Chat (Tekstgeneratie)',
                categoryEmbedding: 'Embedding (Vectorisatie)',
                typeCustom: 'Aangepast (OpenAI Compatibel)',
                typeTransformers: 'Lokale Transformers (K8s)',
                model: 'Modelnaam',
                baseUrl: 'Basis URL',
                apiKey: 'API Sleutel',
                searxng: 'SearXNG URL (Optioneel)',
                searxngHelp: 'Schakelt webzoeken in voor de AI-assistent.',
                addProvider: 'Provider toevoegen',
                deleteProvider: 'Provider verwijderen',
                selectModel: 'Model selecteren',
                privacyMode: 'Privacy Modus',
                privacyLocal: 'Lokaal (Privé)',
                privacyExternal: 'Extern (Publiek/Cloud)',
                privacyWarning: 'Extern AI Model (Privacy Waarschuwing)',
                localMode: 'Lokale AI-modus',
                saveGlobal: 'Sla algemene instellingen op',
                active: 'Standaard',
                setDefault: 'Stel in als standaard',
            },

            userManagement: {
                title: 'Gebruikersbeheer',
                addUser: 'Gebruiker toevoegen',
                publicRegistration: {
                    title: 'Openbare Registratie',
                    description: 'Indien uitgeschakeld, kunnen nieuwe gebruikers zich niet zelf registreren. Beheerders kunnen nog steeds handmatig gebruikers toevoegen.'
                },
                table: {
                    username: 'Gebruikersnaam',
                    role: 'Rol',
                    created: 'Aangemaakt',
                    actions: 'Acties',
                    you: '(Jij)',
                    loading: 'Gebruikers laden...'
                },
                roles: {
                    admin: 'Admin',
                    user: 'Gebruiker'
                },
                modals: {
                    create: {
                        title: 'Gebruiker aanmaken',
                        message: 'Voer de gebruikersnaam in voor de nieuwe gebruiker:',
                        success: 'Gebruiker succesvol aangemaakt',
                        error: 'Gebruiker aanmaken mislukt'
                    },
                    password: {
                        title: 'Wachtwoord instellen',
                        messageName: 'Voer het wachtwoord in voor {name}:',
                        resetTitle: 'Wachtwoord resetten',
                        resetMessage: 'Voer een nieuw wachtwoord in voor {name}:',
                        success: 'Wachtwoord bijgewerkt'
                    },
                    delete: {
                        title: 'Gebruiker verwijderen',
                        message: 'Weet je zeker dat je gebruiker "{name}" wilt verwijderen? Hiermee worden al zijn notities verwijderd.'
                    },
                    role: {
                        title: 'Rol wijzigen',
                        message: 'Rol van {name} wijzigen naar {role}?'
                    }
                }
            }
        }
    },

};

export type Language = 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl';
export type Translations = typeof translations.de;
