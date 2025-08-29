'use client'

import { useState } from 'react'
// --- LÍNEA CORREGIDA ---
// Se revierte a la importación original de tu proyecto.
import { useLocation, Link } from 'react-router';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import {
    Bars3Icon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
    XMarkIcon,
    ChevronRightIcon,
    TagIcon,
    RectangleStackIcon
} from '@heroicons/react/24/outline'
import UserMenu from '../comunes/UserMenu';
// import { Toaster } from 'sonner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const navigationItems = [
    // { name: 'Dashboard', href: '/', icon: HomeIcon },
    // { name: 'Inventario', href: '/inventory', icon: FolderIcon },
    { 
        name: 'Productos', 
        icon: FolderIcon,
        children: [
            { name: 'Categorías', href: '/products/categories', icon: TagIcon },
            { name: 'Catálogo', href: '/products/catalog', icon: RectangleStackIcon },
        ]
    },
    // { name: 'Proveedores', href: '/suppliers', icon: UsersIcon },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface AppLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
}

export default function AppLayout({ children, pageTitle = 'Dashboard' }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    const isItemActive = (item: any) => {
        if (item.href) {
            return location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
        }
        if (item.children) {
            return item.children.some((child: any) => location.pathname.startsWith(child.href));
        }
        return false;
    }

    const NavigationItem = ({ item }: { item: any }) => {
        const isActive = isItemActive(item);

        if (!item.children) {
            return (
                <Link
                    to={item.href}
                    className={classNames(
                        isActive
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                >
                    <item.icon
                        className={classNames(
                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                            'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                    />
                    {item.name}
                </Link>
            )
        }

        return (
            <Disclosure as="div" defaultOpen={isActive}>
                {({ open }) => (
                    <>
                        <DisclosureButton
                            className={classNames(
                                isActive ? 'bg-gray-50' : 'hover:bg-gray-50',
                                'flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-gray-700'
                            )}
                        >
                            <item.icon className="h-6 w-6 shrink-0 text-gray-400" aria-hidden="true" />
                            {item.name}
                            <ChevronRightIcon
                                className={classNames(
                                    open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                                    'ml-auto h-5 w-5 shrink-0'
                                )}
                                aria-hidden="true"
                            />
                        </DisclosureButton>
                        <DisclosurePanel as="ul" className="mt-1 px-2">
                            {item.children.map((subItem: any) => (
                                <li key={subItem.name}>
                                    <Link
                                        to={subItem.href}
                                        className={classNames(
                                            location.pathname.startsWith(subItem.href)
                                                ? 'bg-gray-50 text-indigo-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                            'block rounded-md py-2 pr-2 pl-9 text-sm leading-6'
                                        )}
                                    >
                                        {subItem.name}
                                    </Link>
                                </li>
                            ))}
                        </DisclosurePanel>
                    </>
                )}
            </Disclosure>
        );
    };

    return (
        <>
            <ToastContainer 
                position="top-right" 
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover 
            />

            <div className="h-full bg-gray-100">
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop transition className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0" />
                    <div className="fixed inset-0 flex">
                        <DialogPanel transition className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full">
                            <TransitionChild>
                                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                                <div className="flex h-16 shrink-0 items-center gap-x-3">
                                    <img alt="Inventario ERP" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto" />
                                    <span className="text-lg font-semibold text-gray-800">Inventario ERP</span>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigationItems.map((item) => (
                                                    <li key={item.name}><NavigationItem item={item} /></li>
                                                ))}
                                            </ul>
                                        </li>
                                        <li className="-mx-6 mt-auto"><UserMenu /></li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                        <div className="flex h-16 shrink-0 items-center gap-x-3">
                            <img alt="Inventario ERP" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto" />
                            <span className="text-lg font-semibold text-gray-800">Inventario ERP</span>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigationItems.map((item) => (
                                            <li key={item.name}><NavigationItem item={item} /></li>
                                        ))}
                                    </ul>
                                </li>
                                <li className="-mx-6 mt-auto"><UserMenu /></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-72">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:hidden">
                        <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
                            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                        </button>
                        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">{pageTitle}</div>
                    </div>

                    <main className="py-10">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
