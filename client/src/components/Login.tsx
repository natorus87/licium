import React, { useState } from 'react';
import { useStore } from '../store';
import { LogIn, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, fetchRegistrationStatus, registrationEnabled } = useStore();

    React.useEffect(() => {
        fetchRegistrationStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                const success = await register(username, password);
                if (!success) {
                    setError('Benutzername existiert bereits');
                }
            } else {
                const success = await login(username, password);
                if (!success) {
                    setError('Ungültiger Benutzername oder Passwort');
                }
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>

            <div className="bg-white/80 dark:bg-[#151a24]/80 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-2xl p-8 sm:p-10 w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-10">
                    <img src="/logo_new.jpg" alt="Licium Logo" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 object-contain drop-shadow-xl rounded-2xl" />
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                        {isRegister ? 'Konto erstellen' : 'Willkommen zurück'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {isRegister ? 'Starten Sie Ihre Reise mit Licium' : 'Geben Sie Ihre Daten ein, um fortzufahren'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                            Benutzername
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-[#1e2430] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm transition-all"
                            placeholder="Ihr Benutzername"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                            Passwort
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-[#1e2430] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm transition-all"
                            placeholder="••••••••"
                            required
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <i className="fa fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 press-effect mt-8"
                    >
                        {loading ? (
                            <i className="fa fa-spinner fa-spin text-lg"></i>
                        ) : isRegister ? (
                            <>
                                <UserPlus size={20} />
                                Registrieren
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Anmelden
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    {registrationEnabled && (
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                        >
                            {isRegister
                                ? 'Bereits ein Konto? ' : "Kein Konto? "}
                            <span className="text-blue-600 dark:text-blue-500 font-bold underline-offset-4 hover:underline">
                                {isRegister ? 'Anmelden' : 'Registrieren'}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
