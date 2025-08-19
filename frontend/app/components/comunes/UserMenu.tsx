import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { useKeycloak } from '@react-keycloak/web';
import {
    UserCircleIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon,
    ArrowRightOnRectangleIcon,
    ChevronUpDownIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

const KC_BASE = import.meta.env.VITE_KEYCLOAK_URL as string;
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM as string;
const ACCOUNT_URL = `${KC_BASE}/realms/${KC_REALM}/account`;

function cn(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

function getDisplayName(kc: any) {
    return kc?.tokenParsed?.name
        || kc?.tokenParsed?.preferred_username
        || kc?.tokenParsed?.email
        || 'Usuario';
}
function getEmail(kc: any) {
    return kc?.tokenParsed?.email || '';
}
function getPrimaryRole(kc: any) {
    const realmRoles: string[] = kc?.realmAccess?.roles ?? [];
    return realmRoles[0]; // opcional: muestra el primer rol
}

export default function UserMenu() {
    const { keycloak } = useKeycloak();
    const name = getDisplayName(keycloak);
    const email = getEmail(keycloak);
    const role = getPrimaryRole(keycloak);

    const onLogout = () => keycloak.logout({ redirectUri: window.location.origin });

    return (
        <div className="-mx-6 mt-auto border-t border-gray-200 px-6 py-3">
            <Menu as="div" className="relative">
                <MenuButton className="w-full rounded-xl px-3 py-2 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                    <div className="flex items-center gap-3">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                            <p className="truncate text-xs text-gray-500">
                                {email}
                                {role && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                    {role}
                                </span>
                                )}
                            </p>
                        </div>
                        <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                </MenuButton>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    {/* Panel tipo ChatGPT */}
                    <MenuItems
                        className="
                        absolute bottom-12 left-0 z-50 w-72 overflow-hidden
                        rounded-2xl bg-white shadow-xl ring-1 ring-black/5
                        focus:outline-none
                        "
                    >
                        {/* Header del panel */}
                        <div className="p-3">
                            <div className="flex items-center gap-3">
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                                    {email && <p className="truncate text-xs text-gray-500">{email}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100" />

                        {/* Opciones */}
                        {/* <div className="p-1">
                            <MenuItem>
                                {({ active }) => (
                                <a
                                    href={ACCOUNT_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700',
                                    active && 'bg-gray-50'
                                    )}
                                >
                                    <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
                                    Settings
                                </a>
                                )}
                            </MenuItem>

                            <MenuItem>
                                {({ active }) => (
                                <a
                                    href={`${ACCOUNT_URL}#/password`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700',
                                    active && 'bg-gray-50'
                                    )}
                                >
                                    <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                                    Cambiar contraseña
                                </a>
                                )}
                            </MenuItem>

                            <MenuItem>
                                {({ active }) => (
                                <a
                                    href="https://www.keycloak.org/documentation"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700',
                                    active && 'bg-gray-50'
                                    )}
                                >
                                    <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                                    Ayuda
                                    <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-400" />
                                </a>
                                )}
                            </MenuItem>
                        </div> */}

                        <div className="border-t border-gray-100" />

                        {/* Log out rojo al final */}
                        <div className="p-1">
                            <MenuItem>
                                {({ active }) => (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600',
                                    active && 'bg-red-50'
                                    )}
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                    Cerrar sesión
                                </button>
                                )}
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    );
}