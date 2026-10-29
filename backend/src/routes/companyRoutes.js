const express = require('express');
const router = express.Router();
const config = require('../config');

// Company Profile & About Us details
let companyProfile = {
  brand: {
    name: config.COMPANY_NAME,
    tagline: config.COMPANY_TAGLINE,
    foundedYear: 2016,
    reraLicense: config.RERA_NUMBER,
    dtcpLicense: config.DTCP_LICENSE,
    credaiAffiliation: 'CREDAI Tamil Nadu Chapter #1042',
    valuationStandard: 'Transparent TN Guideline Value vs Fair Market Value in Indian Rupees (INR ₹)',
    mission: 'To empower buyers, builders, and long-term investors with 100% verified, legal dispute-free land and plot developments across the high-growth Parandur Greenfield Airport economic corridor.',
    vision: 'To be the most trusted, transparent, and technology-driven real estate advisory in Tamil Nadu, delivering title security and exponential capital appreciation.',
    overview: 'LLB Real Estate is Tamil Nadu\'s premier land development and acquisition advisory specializing in DTCP and TN RERA approved plots, industrial parcels, and gated communities near the upcoming Parandur Greenfield International Airport, Sunguvarchatram, and the Chennai-Bengaluru Industrial Expressway.'
  },
  offices: [
    {
      title: 'Headquarters',
      address: config.COMPANY_HEADQUARTERS,
      phone: config.CONTACT_PHONE,
      email: config.CONTACT_EMAIL,
      hours: 'Mon - Sat: 9:00 AM - 7:00 PM (IST)'
    },
    {
      title: 'Parandur Site Operations Hub',
      address: config.PARANDUR_SITE_OFFICE,
      phone: config.CONTACT_PHONE,
      hours: 'All Days: 8:00 AM - 6:30 PM (Site Visits & Escorts)'
    }
  ],
  statistics: [
    { label: 'Plots Delivered Near Parandur', value: '1,450+ Plots' },
    { label: 'Title Scrutiny Standard', value: '35-Yr Legal Guarantee' },
    { label: 'Satisfied Plot Owners', value: '980+ Families' },
    { label: 'DTCP & RERA Approvals', value: '100% Pre-Sanctioned' },
    { label: 'Site Inspection Escort', value: 'Daily Free AC Pick-up' }
  ],
  process: [
    {
      step: '01',
      title: 'Browse & Shortlist Plots',
      description: 'Explore verified DTCP & RERA approved plots with exact GPS coordinates, road widths, and pricing.'
    },
    {
      step: '02',
      title: 'Complimentary Site Visit',
      description: 'Book a free chauffeur-driven site inspection from Chennai or Kanchipuram to inspect the ground reality.'
    },
    {
      step: '03',
      title: '30-Year Legal Due Diligence',
      description: 'Receive our full legal scrutiny dossier including Patta, FMB sketch, Encumbrance Certificate (EC), and advocate title opinion.'
    },
    {
      step: '04',
      title: 'Plot Booking & Token',
      description: 'Reserve your plot with an official booking reference (LLB-PRD-XXXX) and transparent documentation.'
    },
    {
      step: '05',
      title: 'Sub-Registrar Registration',
      description: 'Full legal conveyance and immediate Sub-Registrar registration with direct Patta transfer to your name.'
    }
  ],
  services: [
    {
      id: 'svc-01',
      title: 'DTCP & RERA Plot Developments',
      description: 'High-growth residential plots with 40ft/30ft tar roads, avenue plantations, and sweet groundwater in Parandur.'
    },
    {
      id: 'svc-02',
      title: 'Commercial & Warehousing Land',
      description: 'Expressway-facing acreage for logistics hubs, factories, and commercial showrooms near Sunguvarchatram.'
    },
    {
      id: 'svc-03',
      title: 'Agricultural & Farm Investment',
      description: 'Managed agro-farmland and orchard plots with sweet water borewells and free agricultural power.'
    },
    {
      id: 'svc-04',
      title: 'Legal Title Verification',
      description: '35-year Nil-Encumbrance scrutiny, revenue patta validation, and Madras High Court advocate opinion.'
    }
  ],
  contact: {
    phone: config.CONTACT_PHONE,
    whatsapp: config.CONTACT_WHATSAPP,
    tollFree: config.CONTACT_TOLLFREE,
    email: config.CONTACT_EMAIL,
    headquarters: config.COMPANY_HEADQUARTERS,
    siteOffice: config.PARANDUR_SITE_OFFICE
  }
};

router.get('/', (req, res) => {
  res.json(companyProfile);
});

// Admin update company profile
router.put('/', (req, res) => {
  companyProfile = { ...companyProfile, ...req.body };
  res.json({ message: 'Company profile updated successfully', company: companyProfile });
});

module.exports = router;
