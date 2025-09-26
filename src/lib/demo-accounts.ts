// Simple in-memory demo accounts for testing
export const demoAccounts = {
  admin: {
    email: 'admin@amealio.com',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Rajesh Kumar'
  },
  hr: {
    email: 'hr@amealio.com', 
    password: 'hr123',
    role: 'HR',
    name: 'Priya Singh'
  },
  applicant: {
    email: 'user@amealio.com',
    password: 'user123', 
    role: 'APPLICANT',
    name: 'Arjun Sharma'
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
