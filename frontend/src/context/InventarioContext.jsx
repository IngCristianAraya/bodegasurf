import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Asumiendo que está en el mismo nivel o ajustar ruta
import { useInventarioSync } from '../hooks/useInventarioSync'; // Ajustar ruta si es necesario
import { toast } from 'react-toastify';

const InventarioContext = createContext();

export const useInventario = () => {
  return useContext(InventarioContext);
};

export const InventarioProvider = ({ children }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Usar el hook useInventarioSync que maneja la lógica de fetch, cache y mutaciones con React Query
  const {
    productos: productosDesdeHook,
    isLoading: isLoadingDesdeHook,
    error: errorDesdeHook,
    agregarProducto: agregarProductoConSync,
    actualizarStock: actualizarStockConSync, // Esta actualiza solo el stock
    // Necesitamos una función para actualizar todo el producto desde useInventarioSync
    // Si no existe en el hook, la añadiremos o adaptaremos la existente.
    // Por ahora, asumimos que el hook podría tener una función como actualizarProductoCompletoConSync
    // o que la función de actualizar producto en el backend acepta un objeto parcial.
    // Voy a verificar useInventarioSync para la actualización completa del producto.
    // De momento, no hay una función específica para actualizar todo el producto en useInventarioSync.
    // El hook `useInventarioSync` no exporta una función `actualizarProducto` completa,
    // la página `Inventario.jsx` llama a `actualizarProducto` del contexto que no está conectado.
    // Vamos a necesitar añadir/usar una mutación para actualizar producto en el hook.
    // TEMPORALMENTE: dejaremos la función actualizarProducto del contexto sin conectar, 
    // priorizando la carga y adición/eliminación.
    eliminarProducto: eliminarProductoConSync,
  } = useInventarioSync(tenantId); // Pasar tenantId al hook

  // Las funciones de manipulación ahora llamarán a las mutaciones del hook.
  // El estado de 'productos' vendrá directamente del hook (React Query).

  const agregarProductoContext = async (nuevoProducto) => {
    if (!tenantId) {
      toast.error('No se pudo identificar el tenant. Intente de nuevo.');
      return;
    }
    try {
      // La mutación en useInventarioSync ya maneja la llamada API y la actualización de caché.
      await agregarProductoConSync(nuevoProducto);
      toast.success('Producto agregado correctamente');
    } catch (error) {
      console.error('Error en agregarProductoContext:', error);
      toast.error(error.message || 'Error al agregar el producto desde el contexto');
    }
  };

  const actualizarProductoContext = async (productoActualizado) => {
    // TODO: Implementar usando una mutación de useInventarioSync para actualizar el producto completo.
    // Por ahora, esta función no hará nada funcionalmente con el backend.
    console.warn('actualizarProductoContext no está completamente implementado para sincronizar con backend.');
    toast.info('La función de actualizar producto aún necesita conectarse al backend.');
    // Aquí se debería llamar a una mutación similar a agregarProductoConSync pero para PUT/PATCH
    // Ejemplo: await actualizarProductoCompletoConSync(productoActualizado.id, productoActualizado);
  };

  const eliminarProductoContext = async (productoId) => {
    if (!tenantId) {
      toast.error('No se pudo identificar el tenant. Intente de nuevo.');
      return;
    }
    try {
      // La mutación en useInventarioSync ya maneja la llamada API y la actualización de caché.
      await eliminarProductoConSync(productoId);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error en eliminarProductoContext:', error);
      toast.error(error.message || 'Error al eliminar el producto desde el contexto');
    }
  };

  // La función de actualizar stock ya está en el hook y se llama directamente desde donde se necesite
  // o se puede wrappear aquí si se prefiere una interfaz consistente del contexto.
  // Por ahora, los componentes que necesiten actualizar stock pueden usar `actualizarStockConSync` directamente del hook
  // o podemos exponerla desde el contexto también.

  // El useEffect para localStorage ya no es necesario, React Query maneja la caché.

  return (
    <InventarioContext.Provider
      value={{
        productos: productosDesdeHook || [], // Asegurar que siempre sea un array
        isLoading: isLoadingDesdeHook,
        error: errorDesdeHook,
        agregarProducto: agregarProductoContext,
        actualizarProducto: actualizarProductoContext, // Aún no funcional con backend
        eliminarProducto: eliminarProductoContext,
        // Podríamos también exponer 'actualizarStockConSync' si es necesario a través del contexto
        // actualizarStock: actualizarStockConSync,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

// Exportar el contexto por defecto
export default InventarioContext;
