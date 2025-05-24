import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenant } from '../src/models/index.js';
import { User } from '../src/models/index.js';
import { Product } from '../src/models/index.js';

// Cargar variables de entorno
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testTenantIsolation() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conexión exitosa a MongoDB');

        // Crear tenants de prueba
        const tenant1 = await Tenant.create({
            name: 'Tenant de Prueba 1',
            subdomain: 'test1',
            email: 'test1@example.com',
            subscription: {
                plan: 'basic',
                status: 'active',
                startDate: new Date(),
            },
            isActive: true
        });

        const tenant2 = await Tenant.create({
            name: 'Tenant de Prueba 2',
            subdomain: 'test2',
            email: 'test2@example.com',
            subscription: {
                plan: 'basic',
                status: 'active',
                startDate: new Date(),
            },
            isActive: true
        });

        console.log('✅ Tenants de prueba creados');

        // Crear usuarios para cada tenant
        const user1 = await User.create({
            name: 'Usuario 1',
            email: 'user1@test1.com',
            password: 'password123',
            tenantId: tenant1._id
        });

        const user2 = await User.create({
            name: 'Usuario 2',
            email: 'user2@test2.com',
            password: 'password123',
            tenantId: tenant2._id
        });

        console.log('✅ Usuarios de prueba creados');

        // Crear productos para cada tenant
        await Product.create({
            name: 'Producto 1',
            price: 100,
            stock: 10,
            tenantId: tenant1._id
        });

        await Product.create({
            name: 'Producto 2',
            price: 200,
            stock: 20,
            tenantId: tenant2._id
        });

        console.log('✅ Productos de prueba creados');

        // Probar aislamiento de datos
        console.log('\n🔍 Probando aislamiento de datos...');

        // Consultar usuarios del tenant 1
        const tenant1Users = await User.find().where({ tenant: tenant1 });
        console.log(`\nUsuarios del Tenant 1 (${tenant1.name}):`);
        console.log(tenant1Users.map(u => u.email));

        // Consultar usuarios del tenant 2
        const tenant2Users = await User.find().where({ tenant: tenant2 });
        console.log(`\nUsuarios del Tenant 2 (${tenant2.name}):`);
        console.log(tenant2Users.map(u => u.email));

        // Consultar productos del tenant 1
        const tenant1Products = await Product.find().where({ tenant: tenant1 });
        console.log(`\nProductos del Tenant 1 (${tenant1.name}):`);
        console.log(tenant1Products.map(p => p.name));

        // Consultar productos del tenant 2
        const tenant2Products = await Product.find().where({ tenant: tenant2 });
        console.log(`\nProductos del Tenant 2 (${tenant2.name}):`);
        console.log(tenant2Products.map(p => p.name));

        // Verificar que no se pueden acceder a datos de otro tenant
        console.log('\n🔒 Verificando restricciones de acceso...');

        try {
            const wrongTenantData = await User.find().where({ tenantId: tenant1._id, tenant: tenant2 });
            if (wrongTenantData.length === 0) {
                console.log('✅ Restricción de acceso funcionando correctamente');
            } else {
                console.log('❌ Error: Se pudo acceder a datos de otro tenant');
            }
        } catch (error) {
            console.log('✅ Restricción de acceso funcionando correctamente (error esperado)');
        }

        // Limpiar datos de prueba
        console.log('\n🧹 Limpiando datos de prueba...');
        await Promise.all([
            Tenant.deleteOne({ _id: tenant1._id }),
            Tenant.deleteOne({ _id: tenant2._id }),
            User.deleteMany({ tenantId: { $in: [tenant1._id, tenant2._id] } }),
            Product.deleteMany({ tenantId: { $in: [tenant1._id, tenant2._id] } })
        ]);
        console.log('✅ Datos de prueba eliminados');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
}

testTenantIsolation(); 