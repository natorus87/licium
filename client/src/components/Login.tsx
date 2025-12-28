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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/logo_new.jpg" alt="Licium Logo" className="w-48 mb-4 rounded-xl shadow-lg mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {isRegister ? 'Erstellen Sie Ihr Konto' : 'Willkommen zurück'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Benutzername
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Passwort
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? (
                            <div className="animate-spin">⟳</div>
                        ) : isRegister ? (
                            <>
                                <UserPlus size={18} />
                                Registrieren
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Anmelden
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    {registrationEnabled && (
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                            {isRegister
                                ? 'Bereits ein Konto? Anmelden'
                                : "Kein Konto? Registrieren"}
                        </button>
                    )}
                </div>


            </div>
        </div>
    );
};
