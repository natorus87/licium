import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { translations } from '../i18n/translations';
import type { User } from '../types';
import { Trash2, Edit2, Key, UserPlus, Shield, ShieldAlert } from 'lucide-react';

export const UserManagement: React.FC = () => {
    const { fetchUsers, createUser, deleteUser, updateUserRole, adminResetPassword, openModal, user: currentUser, registrationEnabled, toggleRegistration, fetchRegistrationStatus, language } = useStore();
    const t = translations[language];
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadUsers = async () => {
        setIsLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadUsers();
        fetchRegistrationStatus();
    }, []);

    const handleCreateUser = () => {
        openModal({
            type: 'prompt',
            title: t.settings.userManagement.modals.create.title,
            message: t.settings.userManagement.modals.create.message,
            onConfirm: (val) => {
                if (typeof val !== 'string' || !val) return;
                if (typeof val !== 'string' || !val) return;
                const username = val;
                setTimeout(() => {
                    openModal({
                        type: 'prompt',
                        title: t.settings.userManagement.modals.password.title,
                        message: t.settings.userManagement.modals.password.messageName.replace('{name}', username),
                        onConfirm: async (pwVal) => {
                            if (typeof pwVal !== 'string' || !pwVal) return;
                            const password = pwVal;
                            const success = await createUser(username, password);
                            if (success) {
                                loadUsers();
                            } else {
                                alert(t.settings.userManagement.modals.create.error);
                            }
                        }
                    });
                }, 100);
            }
        });
    };

    const handleDeleteUser = (user: User) => {
        openModal({
            type: 'confirm',
            title: t.settings.userManagement.modals.delete.title,
            message: t.settings.userManagement.modals.delete.message.replace('{name}', user.username),
            onConfirm: async () => {
                const success = await deleteUser(user.id);
                if (success) loadUsers();
            }
        });
    };

    const handleResetPassword = (user: User) => {
        openModal({
            type: 'prompt',
            title: t.settings.userManagement.modals.password.resetTitle,
            message: t.settings.userManagement.modals.password.resetMessage.replace('{name}', user.username),
            onConfirm: async (val) => {
                if (typeof val !== 'string' || !val) return;
                const password = val;
                const success = await adminResetPassword(user.id, password);
                if (success) alert(t.settings.userManagement.modals.password.success);
            }
        });
    };

    const handleToggleRole = (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        openModal({
            type: 'confirm',
            title: t.settings.userManagement.modals.role.title,
            message: t.settings.userManagement.modals.role.message.replace('{name}', user.username).replace('{role}', newRole),
            onConfirm: async () => {
                const success = await updateUserRole(user.id, newRole);
                if (success) loadUsers();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.settings.userManagement.title}</h3>
                <button
                    onClick={handleCreateUser}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                    <UserPlus size={16} /> {t.settings.userManagement.addUser}
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.settings.userManagement.publicRegistration.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.settings.userManagement.publicRegistration.description}
                    </p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={async () => {
                            await toggleRegistration(!registrationEnabled);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${registrationEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${registrationEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>

            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="p-3">{t.settings.userManagement.table.username}</th>
                            <th className="p-3">{t.settings.userManagement.table.role}</th>
                            <th className="p-3">{t.settings.userManagement.table.created}</th>
                            <th className="p-3 text-right">{t.settings.userManagement.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {users.map(u => (
                            <tr key={u.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                                    {u.username}
                                    {u.id === currentUser?.id && <span className="ml-2 text-xs text-blue-500">{t.settings.userManagement.table.you}</span>}
                                </td>
                                <td className="p-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {u.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                        {u.role === 'admin' ? t.settings.userManagement.roles.admin : t.settings.userManagement.roles.user}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-500 dark:text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    {u.id !== currentUser?.id && (
                                        <>
                                            <button
                                                onClick={() => handleToggleRole(u)}
                                                className="text-gray-500 hover:text-blue-600"
                                                title={t.settings.userManagement.modals.role.title}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u)}
                                                className="text-gray-500 hover:text-red-600"
                                                title={t.settings.userManagement.modals.delete.title}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleResetPassword(u)}
                                        className="text-gray-500 hover:text-orange-600"
                                        title={t.settings.userManagement.modals.password.resetTitle}
                                    >
                                        <Key size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isLoading && <div className="p-4 text-center text-gray-500">{t.settings.userManagement.table.loading}</div>}
            </div>
        </div >
    );
};
