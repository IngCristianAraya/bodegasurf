import { connectDB } from '../src/config/db.js';
import { User, Product, Customer, Sale, Tenant } from '../src/models/index.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Función para generar un ID de MongoDB válido
const generateObjectId = () => new mongoose.Types.ObjectId();

// Datos de ejemplo
const seedDatabase = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    console.log('Iniciando la siembra de la base de datos...');
    
    // Eliminar datos existentes (excepto el tenant por defecto)
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Sale.deleteMany({}),
    ]);
    
    console.log('Datos existentes eliminados');
    
    // Obtener el tenant por defecto o crearlo si no existe
    let tenant = await Tenant.findOne({ subdomain: 'default' });
    
    if (!tenant) {
      console.log('Creando tenant por defecto...');
      tenant = await Tenant.create({
        name: 'Bodega Principal',
        subdomain: 'default',
        email: 'admin@bodegaprincipal.com',
        phone: '+1234567890',
        address: {
          street: 'Calle Principal 123',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País'
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        },
        settings: {
          currency: 'USD',
          timezone: 'America/New_York',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '12h',
          language: 'es',
          theme: 'light'
        },
        isActive: true
      });
      console.log('Tenant por defecto creado:', tenant);
    }
    
    const tenantId = tenant._id;
    
    // Crear usuarios de ejemplo
    console.log('Creando usuarios de ejemplo...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      tenantId,
      isActive: true
    });
    
    const regularUser = await User.create({
      name: 'Usuario de Prueba',
      email: 'usuario@example.com',
      password: userPassword,
      role: 'user',
      tenantId,
      isActive: true
    });
    
    console.log('Usuarios creados:', { admin: adminUser.email, user: regularUser.email });
    
    // Crear productos de ejemplo
    console.log('Creando productos de ejemplo...');
    const products = [
      {
        name: 'Arroz',
        description: 'Arroz blanco de alta calidad',
        price: 1.50,
        cost: 1.00,
        stock: 100,
        sku: 'ARROZ-001',
        category: 'Granos',
        tenantId
      },
      {
        name: 'Frijoles',
        description: 'Frijoles rojos',
        price: 2.50,
        cost: 1.80,
        stock: 80,
        sku: 'FRIJ-001',
        category: 'Granos',
        tenantId
      },
      {
        name: 'Aceite',
        description: 'Aceite vegetal 1 litro',
        price: 3.00,
        cost: 2.20,
        stock: 50,
        sku: 'ACEI-001',
        category: 'Aceites',
        tenantId
      },
      {
        name: 'Azúcar',
        description: 'Azúcar blanca refinada 1kg',
        price: 1.20,
        cost: 0.80,
        stock: 120,
        sku: 'AZUC-001',
        category: 'Endulzantes',
        tenantId
      },
      {
        name: 'Sal',
        description: 'Sal refinada 500g',
        price: 0.80,
        cost: 0.40,
        stock: 90,
        sku: 'SAL-001',
        category: 'Condimentos',
        tenantId
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} productos creados`);
    
    // Crear clientes de ejemplo
    console.log('Creando clientes de ejemplo...');
    const customers = [
      {
        name: 'Cliente Frecuente',
        email: 'cliente1@example.com',
        phone: '1234-5678',
        address: {
          street: 'Calle 1, #123',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País'
        },
        rtn: '0801199000123',
        tenantId
      },
      {
        name: 'Cliente Ocasional',
        email: 'cliente2@example.com',
        phone: '8765-4321',
        address: {
          street: 'Avenida 2, #456',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '54321',
          country: 'País'
        },
        rtn: '0801199000456',
        tenantId
      },
      {
        name: 'Cliente Mayorista',
        email: 'mayorista@example.com',
        phone: '5555-5555',
        address: {
          street: 'Boulevard Principal, #789',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '67890',
          country: 'País'
        },
        rtn: '0801199000789',
        isWholesale: true,
        tenantId
      }
    ];
    
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`${createdCustomers.length} clientes creados`);
    
    // Crear ventas de ejemplo
    console.log('Creando ventas de ejemplo...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sales = [
      {
        saleNumber: 'V-' + today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-001',
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            quantity: 2,
            price: createdProducts[0].price,
            total: 2 * createdProducts[0].price
          },
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            quantity: 1,
            price: createdProducts[1].price,
            total: 1 * createdProducts[1].price
          }
        ],
        subtotal: 2 * createdProducts[0].price + 1 * createdProducts[1].price,
        tax: 0.15 * (2 * createdProducts[0].price + 1 * createdProducts[1].price),
        discount: 0,
        total: 1.15 * (2 * createdProducts[0].price + 1 * createdProducts[1].price),
        payment: {
          method: 'efectivo',
          status: 'completado',
          amount: 1.15 * (2 * createdProducts[0].price + 1 * createdProducts[1].price),
          change: 0
        },
        status: 'completada',
        customer: createdCustomers[0]._id,
        seller: adminUser._id,
        tenantId,
        createdAt: today
      },
      {
        saleNumber: 'V-' + yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-002',
        items: [
          {
            product: createdProducts[2]._id,
            name: createdProducts[2].name,
            quantity: 5,
            price: createdProducts[2].price,
            total: 5 * createdProducts[2].price
          },
          {
            product: createdProducts[3]._id,
            name: createdProducts[3].name,
            quantity: 10,
            price: createdProducts[3].price,
            total: 10 * createdProducts[3].price
          },
          {
            product: createdProducts[4]._id,
            name: createdProducts[4].name,
            quantity: 20,
            price: createdProducts[4].price,
            total: 20 * createdProducts[4].price
          }
        ],
        subtotal: 5 * createdProducts[2].price + 10 * createdProducts[3].price + 20 * createdProducts[4].price,
        tax: 0.15 * (5 * createdProducts[2].price + 10 * createdProducts[3].price + 20 * createdProducts[4].price),
        discount: 5, // Descuento de $5
        total: 1.15 * (5 * createdProducts[2].price + 10 * createdProducts[3].price + 20 * createdProducts[4].price) - 5,
        payment: {
          method: 'tarjeta',
          status: 'completado',
          amount: 1.15 * (5 * createdProducts[2].price + 10 * createdProducts[3].price + 20 * createdProducts[4].price) - 5,
          cardLast4: '4242',
          cardBrand: 'visa'
        },
        status: 'completada',
        customer: createdCustomers[2]._id, // Cliente mayorista
        seller: regularUser._id,
        notes: 'Venta al por mayor con descuento especial',
        tenantId,
        createdAt: yesterday
      }
    ];
    
    const createdSales = await Sale.insertMany(sales);
    console.log(`${createdSales.length} ventas creadas`);
    
    // Actualizar el stock de productos basado en las ventas
    for (const sale of sales) {
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
    }
    
    console.log('Base de datos sembrada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar la función de siembra
seedDatabase();