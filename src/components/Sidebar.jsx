import { Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Clock,
  Users,
  ClipboardList,
  Truck,
  Info,
} from "lucide-react/dist/esm/icons";

const Sidebar = () => {
  const [active, setActive] = useState("dashboard");

  const menuItems = [
    { name: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "ventas", label: "Ventas", icon: ShoppingCart, path: "/ventas" },
    { name: "inventario", label: "Inventario", icon: Package, path: "/inventario" },
    { name: "historial", label: "Historial", icon: Clock, path: "/historial" },
    { name: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { name: "pedidos", label: "Pedidos", icon: ClipboardList, path: "/pedidos" },
    { name: "proveedores", label: "Proveedores", icon: Truck, path: "/proveedores" },
    { name: "informacion", label: "Información", icon: Info, path: "/informacion" },
  ];

  return (
    <div className="fixed top-16 left-0 bottom-0 w-64 bg-white text-gray-800 font-sans shadow-lg flex flex-col border-r border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto pt-10 pb-6 px-3">
        {/* Navegación */}
        <ul className="space-y-2">
          {menuItems.map(({ name, label, icon: Icon, path }) => (
            <li key={name} className="list-none">
              <Link 
                to={path} 
                className="no-underline block group"
                onClick={() => setActive(name)}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-300 ${
                    active === name 
                      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-200 hover:text-orange-600"
                  } group-hover:translate-x-1`}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    active === name ? 'text-white' : 'text-orange-500 group-hover:text-orange-600'
                  }`} />
                  <span className="transition-colors duration-300">{label}</span>
                  {active === name && (
                    <div className="ml-auto w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

