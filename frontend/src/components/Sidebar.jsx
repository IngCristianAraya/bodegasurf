import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Clock,
  Users,
  ClipboardList,
  Truck,
  Info,
  CreditCard,
  Receipt,
  Settings,
  Shield,
} from "lucide-react/dist/esm/icons";

const Sidebar = () => {
  const [active, setActive] = useState("dashboard");

  const menuItems = [
    { name: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "ventas", label: "Ventas", icon: ShoppingCart, path: "/ventas" },
    { name: "transacciones", label: "Transacciones", icon: CreditCard, path: "/transacciones" },
    { name: "inventario", label: "Inventario", icon: Package, path: "/inventario" },
    { name: "historial", label: "Historial", icon: Clock, path: "/historial" },
    { name: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { name: "pedidos", label: "Pedidos", icon: ClipboardList, path: "/pedidos" },
    { name: "proveedores", label: "Proveedores", icon: Truck, path: "/proveedores" },
    { name: "informacion", label: "Información", icon: Info, path: "/informacion" },
    // Sección de administración
    { 
      name: "admin", 
      label: "Administración", 
      icon: Shield, 
      path: "/admin",
      children: [
        { 
          name: "payment-settings", 
          label: "Configuración de Pagos", 
          icon: Settings, 
          path: "/admin/payment-settings" 
        }
      ]
    },
  ];

  // Verificar si el usuario es administrador
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filtrar elementos del menú basados en permisos
  const filteredMenuItems = menuItems.filter(item => {
    if (item.name === 'admin') {
      return isAdmin; // Solo mostrar sección de administración a admins
    }
    return true;
  });

  return (
    <div className="fixed top-16 left-0 bottom-0 w-64 bg-white text-gray-800 font-sans shadow-lg flex flex-col border-r border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto pt-10 pb-6 px-3">
        {/* Navegación */}
        <ul className="space-y-2">
          {filteredMenuItems.map(({ name, label, icon: Icon, path, children }) => (
            <li key={name} className="list-none">
              {children ? (
                <div className="mb-2">
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-500 text-sm font-medium uppercase tracking-wider">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <ul className="mt-1 space-y-1 pl-8">
                    {children.map(({ name: childName, label: childLabel, icon: ChildIcon, path: childPath }) => (
                      <li key={childName} className="list-none">
                        <Link 
                          to={childPath} 
                          className="no-underline block group"
                          onClick={() => setActive(childName)}
                        >
                          <div
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
                              active === childName 
                                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md" 
                                : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                            } group-hover:translate-x-1`}
                          >
                            <ChildIcon className={`w-4 h-4 transition-colors duration-300 ${
                              active === childName ? 'text-white' : 'text-orange-500 group-hover:text-orange-600'
                            }`} />
                            <span>{childLabel}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link 
                  to={path} 
                  className="no-underline block group"
                  onClick={() => setActive(name)}
                >
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-300 ${
                      active === name 
                        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                    } group-hover:translate-x-1`}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      active === name ? 'text-white' : 'text-orange-500 group-hover:text-orange-600'
                    }`} />
                    <span>{label}</span>
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

