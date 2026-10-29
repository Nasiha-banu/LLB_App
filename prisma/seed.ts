import { PrismaClient, Role, BookingType, BookingStatus, PropertyType, PropertyStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma Database Seed for LLB Real Estate (Parandur)...');

  // 1. Clean existing records if any
  await prisma.favourite.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.propertyDocument.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('Admin@123', salt);
  const userPassword = bcrypt.hashSync('Password@123', salt);

  const admin = await prisma.user.create({
    data: {
      id: 'usr-admin-01',
      name: 'LLB Administrator',
      email: 'admin@llb.com',
      phone: '+919884099881',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      verifiedEmail: true,
      verifiedPhone: true
    }
  });

  const investor = await prisma.user.create({
    data: {
      id: 'usr-demo-01',
      name: 'Sundar Ramanathan',
      email: 'investor@llb.com',
      phone: '+919876543210',
      passwordHash: userPassword,
      role: Role.INVESTOR,
      verifiedEmail: true,
      verifiedPhone: true
    }
  });

  console.log('✅ Created Demo Users (Admin and Investor)');

  // 3. Create Parandur Properties
  const parandurProperties = [
    {
      id: 'LLB-PRD-01',
      title: 'Parandur Airport City Phase 1',
      subtitle: 'DTCP & TN RERA Approved Gated Layout',
      category: 'Residential Plots',
      type: PropertyType.PLOT,
      location: 'Parandur Airport North Gate Corridor, Kanchipuram - 631552',
      microMarket: 'Parandur Airport Corridor',
      latitude: 12.9885,
      longitude: 79.7642,
      distanceToAirport: '3.2 km to Proposed Terminal 1',
      areaSqFt: 1500,
      areaCents: 3.44,
      pricePerSqFt: 1450,
      totalPrice: '₹21,75,000',
      priceNumeric: BigInt(2175000),
      featured: true,
      status: PropertyStatus.AVAILABLE,
      approvalAuthority: 'DTCP & TN RERA Approved',
      reraNumber: 'TN/RERA/0412/2025',
      dtcpNumber: 'DTCP/KPM/182/2024',
      roadWidth: '40 Ft Blacktop Road',
      facing: 'North-East (Vaastu Compliant)',
      groundWater: 'Sweet Potable Water at 32 Ft',
      electricity: 'Dedicated 3-Phase Transformer & EB Lines',
      availablePlots: 14,
      totalPlots: 36,
      plotsList: ['Plot #04', 'Plot #07', 'Plot #11', 'Plot #15', 'Plot #18', 'Plot #22', 'Plot #28', 'Plot #31'],
      description: 'Exclusive gated plot development strategically positioned along the proposed 6-lane Parandur Airport Express Link. Unmatched appreciation potential with direct highway access, sweet groundwater, clear titles verified for 30 years, and DTCP sanction.',
      amenities: [
        '40 Ft & 30 Ft Blacktop Avenue Roads',
        'Gated Community with 24/7 Security Arch',
        'Underground Drainage & Water Pipelines',
        'Solar Street Lighting with LED Fixtures',
        'Avenue Tree Plantation & Landscaped Parks',
        'Sweet Groundwater at Shallow Depth',
        'Clear 30-Year Encumbrance Free Title'
      ]
    },
    {
      id: 'LLB-PRD-02',
      title: 'Sunguvarchatram Logistics & Commercial Acreage',
      subtitle: 'Prime Expressway Facing Industrial/Commercial Parcel',
      category: 'Commercial Land',
      type: PropertyType.COMMERCIAL,
      location: 'Sunguvarchatram Industrial Hub, Chennai-Bengaluru NH-48 Corridor',
      microMarket: 'Sunguvarchatram Corridor',
      latitude: 12.9554,
      longitude: 79.8421,
      distanceToAirport: '9.5 km via 4-Lane Link',
      areaSqFt: 43560,
      areaCents: 100.0,
      pricePerSqFt: 950,
      totalPrice: '₹4.13 Cr',
      priceNumeric: BigInt(41382000),
      featured: true,
      status: PropertyStatus.AVAILABLE,
      approvalAuthority: 'DTCP Industrial Conversion Feasible',
      reraNumber: 'Exempt / Land Parcel',
      dtcpNumber: 'DTCP/ZONING/IND-44/2024',
      roadWidth: '100 Ft National Highway Service Road',
      facing: 'East Facing',
      groundWater: 'High Yield Borewell (45 Ft)',
      electricity: 'HT Power Line Feasibility Approved',
      availablePlots: 1,
      totalPlots: 1,
      plotsList: ['Parcel A - 1.00 Acre'],
      description: '1.00 Acre (100 Cents) prime commercial land parcel on the high-velocity Chennai-Bengaluru Industrial Corridor. Directly accessible from the NH-48 service lane and connecting directly to Parandur Airport South entrance.',
      amenities: [
        '100 Ft NH-48 Service Road Access',
        'High Tension (HT) Power Feasibility',
        'Heavy Vehicle Container Movement Ready',
        'High Ground Level with Zero Inundation',
        'Compound Wall Fencing Completed',
        'Direct Link to SIPCOT Industrial Parks'
      ]
    },
    {
      id: 'LLB-PRD-03',
      title: 'Thandalam Junction Greenfield Villa Enclave',
      subtitle: 'Gated Villa Community near Education & Airport Corridor',
      category: 'Villa Community Plot',
      type: PropertyType.PLOT,
      location: 'Thandalam-Parandur Link Road, Near Saveetha Nagar',
      microMarket: 'Thandalam Corridor',
      latitude: 13.0182,
      longitude: 79.9863,
      distanceToAirport: '14.0 km via Expressway',
      areaSqFt: 1800,
      areaCents: 4.13,
      pricePerSqFt: 1850,
      totalPrice: '₹33,30,000',
      priceNumeric: BigInt(3330000),
      featured: true,
      status: PropertyStatus.AVAILABLE,
      approvalAuthority: 'CMDA / DTCP Sanctioned',
      reraNumber: 'TN/RERA/0921/2024',
      dtcpNumber: 'DTCP/CMDA/TH-88/2024',
      roadWidth: '30 Ft Tar Road',
      facing: 'North Facing (100% Vaastu)',
      groundWater: 'Mineral Potable Groundwater at 28 Ft',
      electricity: 'Underground Cabling & Transformer',
      availablePlots: 8,
      totalPlots: 24,
      plotsList: ['Plot #02', 'Plot #05', 'Plot #09', 'Plot #14', 'Plot #19', 'Plot #21'],
      description: 'Ready-to-build luxury villa plots in a rapidly expanding educational and residential enclave. Minutes away from top engineering and medical colleges.',
      amenities: [
        'Gated Township with Boom Barrier & CCTV',
        '30 Ft Tarred Avenue with Kerbstones',
        'Children Play Area & Open Green Park',
        'Individual Water Tap Connection Point',
        'Bank Loan Pre-Approved by SBI & HDFC'
      ]
    }
  ];

  for (const prop of parandurProperties) {
    await prisma.property.create({
      data: {
        ...prop,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80', sortOrder: 0 },
            { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80', sortOrder: 1 }
          ]
        },
        documents: {
          create: [
            { title: 'DTCP Approved Layout Plan', documentUrl: 'https://llbrealestate.com/docs/dtcp-plan.pdf', docType: 'APPROVAL' },
            { title: '30-Year Encumbrance Certificate (EC)', documentUrl: 'https://llbrealestate.com/docs/ec-30yr.pdf', docType: 'LEGAL' }
          ]
        }
      }
    });
  }

  console.log('✅ Created Parandur Properties and Documents');

  // 4. Create Initial Bookings
  await prisma.booking.create({
    data: {
      id: 'bk-seed-001',
      bookingReference: 'LLB-PRD-2026-4891',
      idempotencyKey: 'idemp-seed-001',
      type: BookingType.PLOT_BOOKING,
      status: BookingStatus.PENDING,
      propertyId: 'LLB-PRD-01',
      userId: investor.id,
      plotUnit: 'Plot #15',
      userName: 'Sundar Ramanathan',
      userEmail: 'investor@llb.com',
      userPhone: '+919876543210',
      siteVisitDate: '2026-11-05',
      siteVisitTime: '10:30 AM',
      notes: 'Interested in acquiring adjacent plots #15 and #16 for family compound. Require legal dossier.',
      termsAccepted: true
    }
  });

  console.log('✅ Created Demo Bookings');
  console.log('✨ Prisma Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding Prisma DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
