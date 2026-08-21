import React from 'react';
import { APP_CONFIG } from '../../config/constants';
import { ExternalLink, Calendar, HardDrive, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 mt-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Organization Info */}
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-white text-sm">
              {APP_CONFIG.APP_NAME}
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            {APP_CONFIG.DEPARTMENT_FULL}
          </p>
        </div>

        {/* Middle / Right: Links & Badges */}
        <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
          <a
            href={APP_CONFIG.GOOGLE_CALENDAR_EMBED_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Calendar ({APP_CONFIG.CALENDAR_ID})</span>
          </a>

          <a
            href={APP_CONFIG.GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Drive เอกสาร</span>
          </a>

          <span className="text-slate-600">|</span>

          <span className="text-emerald-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Cloudflare Pages & Google Sync (100% Free)</span>
          </span>
        </div>

      </div>
    </footer>
  );
};
