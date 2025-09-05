// Script d'initialisation MongoDB
db = db.getSiblingDB('ecoshare');

// Créer l'utilisateur de l'application
db.createUser({
  user: 'ecoshare_user',
  pwd: 'ecoshare_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecoshare'
    }
  ]
});

// Créer les collections avec des index
db.createCollection('users');
db.createCollection('objects');
db.createCollection('foods');
db.createCollection('associations');
db.createCollection('posts');
db.createCollection('contracts');
db.createCollection('rewards');
db.createCollection('deliveries');
db.createCollection('messages');
db.createCollection('pendingusers');

// Index pour les performances
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'address.coordinates': '2dsphere' });

db.objects.createIndex({ 'aiClassification.category': 1 });
db.objects.createIndex({ 'location.coordinates': '2dsphere' });
db.objects.createIndex({ status: 1 });
db.objects.createIndex({ owner: 1 });

db.associations.createIndex({ 'address.coordinates': '2dsphere' });
db.associations.createIndex({ type: 1 });
db.associations.createIndex({ status: 1 });
db.associations.createIndex({ 'acceptedCategories': 1 });

db.posts.createIndex({ author: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ tags: 1 });

db.contracts.createIndex({ contractId: 1 }, { unique: true });
db.contracts.createIndex({ status: 1 });
db.contracts.createIndex({ createdAt: -1 });

print('✅ Base de données ECOSHARE initialisée avec succès');
