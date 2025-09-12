// Simple in-memory demo accounts for testing
export const demoAccounts = {
  admin: {
    email: 'admin@amealio.com',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Admin User'
  },
  hr: {
    email: 'hr@amealio.com', 
    password: 'hr123',
    role: 'HR',
    name: 'HR Manager'
  },
  applicant: {
    email: 'user@amealio.com',
    password: 'user123', 
    role: 'APPLICANT',
    name: 'John Doe'
  }
}

export function validateDemoAccount(email: string, password: string) {
  const account = Object.values(demoAccounts).find(acc => acc.email === email)
  
  if (account && account.password === password) {
    return {
      id: account.email,
      email: account.email,
      name: account.name,
      role: account.role
    }
  }
  
  return null
}
