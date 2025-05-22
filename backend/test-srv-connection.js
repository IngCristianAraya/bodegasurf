import { MongoClient, ServerApiVersion } from 'mongodb';

// Usar la cadena de conexión SRV con la contraseña
const uri = 'mongodb+srv://ingcristianaraya:HPLXAn17gou4e80F@ventasbodega.d0rujmo.mongodb.net/ventas_bodega?retryWrites=true&w=majority&appName=ventasbodega';

async function testConnection() {
  console.log('Intentando conectar a MongoDB con la siguiente URI:');
  console.log(uri.replace(/:([^:]+)@/, ':***@')); // Ocultar la contraseña en los logs

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Forzar el uso de la versión 4.4 o superior del controlador
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('\nConectando a MongoDB Atlas...');
    await client.connect();
    
    // Enviar un ping para confirmar la conexión
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conexión exitosa a MongoDB Atlas!");
    
    // Listar las bases de datos
    console.log('\nListando bases de datos disponibles:');
    const databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach(db => console.log(`- ${db.name}`));
    
  } catch (error) {
    console.error('\n❌ Error al conectar a MongoDB Atlas:');
    console.error(error.message);
    
    // Mostrar información de depuración adicional
    console.log('\nInformación de depuración:');
    console.log('- Versión de Node.js:', process.version);
    console.log('- Sistema operativo:', process.platform, process.arch);
    console.log('- Tiempo de ejecución:', new Date().toISOString());
    
    // Mostrar información de red
    console.log('\nInformación de red:');
    console.log('- Resolución DNS de ventasbodega.d0rujmo.mongodb.net:');
    
    try {
      const dns = await import('dns').promises;
      const addresses = await dns.resolve4('ventasbodega.d0rujmo.mongodb.net');
      console.log('  - Direcciones IP encontradas:', addresses);
    } catch (dnsError) {
      console.error('  - Error al resolver la dirección DNS:', dnsError.message);
    }
    
  } finally {
    // Cerrar la conexión
    await client.close();
    process.exit(0);
  }
}

// Ejecutar la función principal
testConnection().catch(console.error);
