import React from 'react';
import { ArrowLeft, AlertTriangle, ShieldAlert, Clock, Download, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-n10 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[3px] shadow-sm border border-n40 overflow-hidden">
        
        {/* Header */}
        <div className="bg-n800 text-white p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Terms and Conditions</h1>
            <p className="text-n300 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 text-n800 leading-relaxed">
            
            <div className="p-4 bg-b50 border border-b200 rounded-[3px]">
                <h3 className="flex items-center gap-2 font-bold text-b600 mb-2">
                    <AlertTriangle size={20} />
                    Beta Service Notice
                </h3>
                <p className="text-sm text-b600">
                    Retro14 is currently in a <strong>Beta</strong> phase. The service is provided "as is" and "as available" for testing and evaluation purposes.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-n800 border-b border-n40 pb-2">
                    <ShieldAlert size={20} className="text-n400" />
                    1. No Data Security Guarantee
                </h2>
                <p className="text-n600 mb-2">
                    While we strive to implement standard security measures, <strong>no data security is guaranteed during this beta period</strong>. 
                </p>
                <ul className="list-disc pl-5 space-y-1 text-n600">
                    <li>Do not upload sensitive, confidential, or personally identifiable information (PII) beyond what is strictly necessary for account creation.</li>
                    <li>We explicitly disclaim liability for any data breaches, unauthorized access, or disclosure of information stored on our platform.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-n800 border-b border-n40 pb-2">
                    <Clock size={20} className="text-n400" />
                    2. No Uptime Guarantee
                </h2>
                <p className="text-n600">
                    Services may be interrupted, suspended, or terminated at any time without prior notice. We do not guarantee continuous, uninterrupted, or error-free operation of the service. Maintenance updates may occur frequently and cause downtime.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-n800 border-b border-n40 pb-2">
                    <Database size={20} className="text-n400" />
                    3. No Data Persistence
                </h2>
                <p className="text-n600 mb-2">
                    <strong>Your data may be lost at any time.</strong> We do not guarantee permanent storage or persistence of your sprint boards, retrospectives, users, or settings. 
                </p>
                <p className="text-n600">
                    The database may be reset, migrated, or cleared as part of development cycles.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-n800 border-b border-n40 pb-2">
                    <Download size={20} className="text-n400" />
                    4. Data Export Recommendation
                </h2>
                <div className="bg-y50 border border-y200 p-4 rounded-[3px]">
                    <p className="text-n800 font-medium mb-1">Important:</p>
                    <p className="text-n700 text-sm">
                        We strongly recommend that you <strong>export and download your sprint board data immediately after every session</strong>. Use the "Export to PDF" or "Copy to Clipboard" features provided within the application to save your retrospective outcomes locally.
                    </p>
                </div>
            </section>

             <section>
                <h2 className="text-xl font-bold mb-4 text-n800 border-b border-n40 pb-2">
                    5. Acceptance of Terms
                </h2>
                <p className="text-n600">
                    By creating an account and using Retro14, you acknowledge that you have read, understood, and agreed to be bound by these terms. You accept the risks associated with using beta software, including the potential for data loss and security vulnerabilities.
                </p>
            </section>
        </div>

      </div>
    </div>
  );
};
