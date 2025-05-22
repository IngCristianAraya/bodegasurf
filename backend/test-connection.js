import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Usar la cadena de conexión del archivo .env o una predeterminada
const uri = process.env.MONGODB_URI || 'mongodb+srv://ingcristianaraya:HPLXAn17gou4e80F@ventasbodega.d0rujmo.mongodb.net/ventas_bodega?retryWrites=true&w=majority';

async function run() {
  console.log('Intentando conectar a MongoDB con la siguiente URI:');
  console.log(uri.replace(/:([^:]+)@/, ':***@')); // No mostrar la contraseña en los logs

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
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
    
  } finally {
    // Cerrar la conexión
    await client.close();
    process.exit(0);
  }
}

// Ejecutar la función principal
run().catch(console.error);
