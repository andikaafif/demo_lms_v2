export type Accreditation = 'A' | 'B' | 'C' | 'Belum Terakreditasi'

export interface SchoolProfile {
  id: string
  name: string
  npsn: string
  logoUrl: string
  address: string
  phone: string
  email: string
  website: string
  principalName: string
  accreditation: Accreditation
  description: string
  establishedYear: number
}
