'use client'

import { useState, useLayoutEffect } from 'react'
import { useLocation, Link } from 'react-router'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import {
    Bars3Icon,
    CalendarIcon,
    ChartPieIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
    XMarkIcon,
    ChevronRightIcon,
    TagIcon,
    RectangleStackIcon
} from '@heroicons/react/24/outline'
import UserMenu from '../comunes/UserMenu';

const navigationItems = [
    // { name: 'Dashboard', href: '/', icon: HomeIcon },
    // { name: 'Inventario', href: '/inventory', icon: FolderIcon },
    { 
        name: 'Productos', 
        icon: DocumentDuplicateIcon,
        children: [
            { name: 'Categorías', href: '/products/categories', icon: TagIcon },
            { name: 'Catálogo', href: '/products/catalog', icon: RectangleStackIcon },
        ]
    },
    // { name: 'Proveedores', href: '/suppliers', icon: UsersIcon },
    // { name: 'Reportes', href: '/reports', icon: ChartPieIcon },
    // { name: 'Calendario', href: '/calendar', icon: CalendarIcon },
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

    // Función para determinar si un item está activo
    const isItemActive = (item: any) => {
        if (item.href) {
            return location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
        }
        if (item.children) {
            return item.children.some((child: any) => location.pathname === child.href)
        }
        return false
    }

    // Componente para renderizar elementos de navegación
    
    const NavigationItem = ({ item }: { item: any }) => {
        const location = useLocation();

        const isActive = (href: string) =>
            location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

        const isItemActive = item.children?.some((child: any) => isActive(child.href));
        // const isItemActive = true;

        return (
            <Disclosure as="div" defaultOpen={true}>
                {({ open }) => (
                    <>
                        <DisclosureButton
                            className={classNames(
                                isItemActive
                                    ? 'bg-gray-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold',
                            )}
                        >
                            <item.icon
                                aria-hidden="true"
                                className={classNames(
                                    isItemActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                    'h-6 w-6 shrink-0',
                                )}
                            />
                            {item.name}
                            <ChevronRightIcon
                                aria-hidden="true"
                                className={classNames(
                                    open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                                    'ml-auto h-5 w-5 shrink-0 transition-transform duration-200',
                                )}
                            />
                        </DisclosureButton>
                        <DisclosurePanel as="ul" className="mt-1 space-y-1">
                            {item.children.map((subItem: any) => (
                                <li key={subItem.name}>
                                    <Link
                                        to={subItem.href}
                                        className={classNames(
                                            location.pathname === subItem.href
                                                ? 'bg-gray-50 text-indigo-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                            'flex items-center gap-x-3 block rounded-md py-2 pl-9 pr-2 text-sm font-semibold',
                                        )}
                                    >
                                        <subItem.icon
                                            aria-hidden="true"
                                            className={classNames(
                                                location.pathname === subItem.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                                'h-5 w-5 shrink-0',
                                            )}
                                        />
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
            <div className="h-full bg-white">
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>

                            {/* Mobile Sidebar */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                                <div className="flex h-16 shrink-0 items-center">
                                    <img
                                        alt="Inventario ERP"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                        className="h-8 w-auto"
                                    />
                                    <span className="ml-3 text-xl font-semibold text-gray-900">Inventario ERP</span>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigationItems.map((item) => (
                                                    <li key={item.name}>
                                                        <NavigationItem item={item} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                        <li className="-mx-6 mt-auto">
                                            {/* <UserMenu /> */}
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                        <div className="flex h-16 shrink-0 items-center">
                            <img
                                alt="Inventario ERP"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto"
                            />
                            <span className="ml-3 text-xl font-semibold text-gray-900">Inventario ERP</span>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigationItems.map((item) => (
                                            <li key={item.name}>
                                                <NavigationItem item={item} />
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li className="-mx-6 mt-auto">
                                    {/* <UserMenu /> */}
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden">
                    <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>
                    <div className="flex-1 text-sm/6 font-semibold text-gray-900">{pageTitle}</div>
                    <a href="#">
                        <span className="sr-only">Your profile</span>
                        <img
                            alt=""
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            className="size-8 rounded-full bg-gray-50"
                        />
                    </a>
                </div>

                <main className="py-4 lg:pl-72">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

        </>
    )
}
