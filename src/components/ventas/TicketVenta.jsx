import React from 'react';
import { Printer } from 'lucide-react';
import ReactToPrint from 'react-to-print';

class TicketVenta extends React.Component {
  render() {
    const { items, total, fecha, numeroTicket } = this.props;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-xs mx-auto">
        <div className="text-center mb-3">
          <h3 className="font-bold text-lg">BODEGA STORE</h3>
          <p className="text-xs text-gray-600">Calle Principal #123, Local 45</p>
          <p className="text-xs text-gray-600">Telf: (01) 234-5678</p>
          <p className="text-xs text-gray-600">RUC: 20123456789</p>
          <p className="text-xs mt-2">Ticket #{numeroTicket || '0000'}</p>
          <p className="text-xs">{fecha || new Date().toLocaleString()}</p>
        </div>
        
        <div className="border-t border-b border-gray-200 py-2 my-2">
          <div className="grid grid-cols-12 text-xs font-semibold mb-1">
            <div className="col-span-6">Producto</div>
            <div className="col-span-2 text-center">Cant.</div>
            <div className="col-span-4 text-right">Importe</div>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 text-xs py-1">
              <div className="col-span-6 truncate">{item.nombre}</div>
              <div className="col-span-2 text-center">{item.cantidad}</div>
              <div className="col-span-4 text-right">S/ {(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
          ))}
        </div>
        
        <div className="text-right mt-2">
          <div className="text-sm font-semibold">
            Total: <span className="text-lg">S/ {total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center mt-4 text-xs text-gray-500">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto</p>
        </div>
      </div>
    );
  }
}

export { TicketVenta };
export default TicketVenta;
