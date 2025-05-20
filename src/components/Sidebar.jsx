import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingCart,
  Package,
  Clock,
  Users,
  ClipboardList,
  Truck,
  Info,
} from "lucide-react";

const Sidebar = () => {
  const [active, setActive] = useState("ventas");

  const menuItems = [
    { name: "ventas", label: "Ventas", icon: ShoppingCart, path: "/ventas" },
    { name: "inventario", label: "Inventario", icon: Package, path: "/inventario" },
    { name: "historial", label: "Historial", icon: Clock, path: "/historial" },
    { name: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { name: "pedidos", label: "Pedidos", icon: ClipboardList, path: "/pedidos" },
    { name: "proveedor", label: "Proveedores", icon: Truck, path: "/proveedor" },
    { name: "informacion", label: "Información", icon: Info, path: "/informacion" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 font-sans animate-slide-in-left shadow-lg flex flex-col justify-start">
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        <img src="/logo_sin_gb_blanco.webp" alt="Logo" className="w-full h-20 object-contain" />
      </div>

      {/* Panel General */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide">Panel General</h1>
      </div>

      {/* Navegación */}
      <ul className="space-y-2">
        {menuItems.map(({ name, label, icon: Icon, path }) => (
          <li
            key={name}
            onClick={() => setActive(name)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium cursor-pointer transition-all duration-300 ${
              active === name ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
          >
            <Icon className="w-5 h-5" />
            <Link to={path} className="text-white no-underline w-full block">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

