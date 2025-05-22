import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    console.log('Conectando a MongoDB Atlas...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conexión exitosa a MongoDB Atlas!");
    
    // Listar las bases de datos
    console.log('\nListando bases de datos disponibles:');
    const databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach(db => console.log(`- ${db.name}`));
    
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB Atlas:', error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    process.exit(0);
  }
}

run().catch(console.dir);
