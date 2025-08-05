import dotenv from 'dotenv'
dotenv.config({ override: true })

import { userService } from './services/user.service.js'

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...')
    
    // Create test users
    const testUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        userType: 'admin'
      },
      {
        email: 'member@example.com',
        password: 'member123',
        userType: 'regular'
      }
    ]
    
    for (const userData of testUsers) {
      try {
        const user = await userService.add(userData)
        console.log(`✅ Created user: ${user.email} (${user.userType})`)
      } catch (err) {
        if (err.message === 'User with this email already exists') {
          console.log(`⚠️  User already exists: ${userData.email}`)
        } else {
          console.error(`❌ Failed to create user ${userData.email}:`, err.message)
        }
      }
    }
    
    console.log('🎉 User seeding completed!')
    console.log('\n📋 Test Accounts:')
    console.log('Admin: admin@example.com / admin123')
    console.log('Member: member@example.com / member123')
    
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  }
}

seedUsers() 