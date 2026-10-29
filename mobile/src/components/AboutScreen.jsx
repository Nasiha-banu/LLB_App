import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Award, Phone, Mail, MessageCircle, 
  MapPin, Compass, Car, Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function AboutScreen() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCompany();
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="pb-20 space-y-5 px-4 pt-4 bg-white animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-2 py-5 px-4 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-black text-white shadow-md flex items-center justify-center">
          <span className="font-serif-luxury text-xl font-black text-white">LLB</span>
        </div>
        <h2 className="font-serif-luxury text-base font-black text-black tracking-wide">
          {company?.brand?.name || 'LLB REAL ESTATE'}
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          {company?.brand?.tagline || 'Chennai Luxury Estates & High-Value Land Acquisitions'}
        </p>
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-600 pt-1">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            TN RERA: {company?.brand?.reraLicense || 'TN/AGENT/0442/2021'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold">
            CMDA Approved
          </span>
        </div>
      </div>

      {/* Advisory Overview */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Private Advisory Overview
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {company?.brand?.overview ||
            'LLB Real Estate is Chennai\'s premier private acquisitions advisory representing high-value land parcels, coastal beachfront acreage, and luxury residential estates along East Coast Road (ECR), Boat Club Road, Poes Garden, and Old Mahabalipuram Road (OMR).'}
        </p>
      </div>

      {/* Statistics Grid */}
      {company?.statistics && (
        <div className="grid grid-cols-2 gap-2.5">
          {company.statistics.map((stat, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-sm">
              <span className="text-base font-black text-black block">
                {stat.value}
              </span>
              <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Core Services */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Specialized Advisory Services
        </h3>
        <div className="space-y-2.5">
          {company?.services?.map((svc) => (
            <div
              key={svc.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
            >
              <div className="p-2 rounded-lg bg-black text-white shrink-0 mt-0.5 shadow-sm">
                {svc.icon === 'Compass' && <Compass className="w-4 h-4" />}
                {svc.icon === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
                {svc.icon === 'TrendingUp' && <Award className="w-4 h-4" />}
                {svc.icon === 'Car' && <Car className="w-4 h-4" />}
                {svc.icon === 'Cpu' && <Cpu className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-black">{svc.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{svc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Executive Leadership & Counsel
        </h3>
        <div className="space-y-2.5">
          {company?.leadership?.map((leader, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-black text-black">{leader.name}</h4>
              <p className="text-[10px] font-bold text-slate-700">{leader.role}</p>
              <p className="text-[9px] text-slate-500 mt-0.5 italic">{leader.credentials}</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{leader.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Locations */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          Physical Advisory Lounges
        </h3>
        {company?.offices?.map((off, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-black">{off.name}</h4>
            <div className="flex items-start space-x-1.5 text-[11px] text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
              <span>{off.address}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Contact Channels */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-black uppercase tracking-wider">
          VIP Concierge Direct Channels
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:+919884099881"
            className="p-3 rounded-xl bg-white border border-slate-200 flex items-center space-x-2 text-black hover:border-black active-press transition-colors font-bold shadow-sm"
          >
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">+91 98840 99881</span>
          </a>
          <a
            href="https://wa.me/919884099881"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-white border border-slate-200 flex items-center space-x-2 text-black hover:border-emerald-600 active-press transition-colors font-bold shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>WhatsApp VIP</span>
          </a>
          <a
            href="mailto:concierge@llbrealestate.com"
            className="col-span-2 p-3 rounded-xl bg-white border border-slate-200 flex items-center space-x-2 text-black hover:border-black active-press transition-colors truncate font-bold shadow-sm"
          >
            <Mail className="w-4 h-4 text-black shrink-0" />
            <span className="truncate">concierge@llbrealestate.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
