const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createUser() {
  try {
    console.log('🔧 User Creation Tool');
    console.log('====================\n');
    
    const email = await askQuestion('Enter email: ');
    const name = await askQuestion('Enter name (optional): ');
    const password = await askQuestion('Enter password: ');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ User with this email already exists!');
      rl.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        currency: 'USD',
        timezone: 'America/New_York',
        categories: 'Food,Travel,Shopping,Bills',
        emailNotif: false,
        twoFA: false
      }
    });
    
    console.log('\n✅ User created successfully!');
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.name || 'Not set'}`);
    console.log(`   ID: ${newUser.id}`);
    console.log('\nYou can now login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createUser();
