// src/features/dashboard/IntegrationsTab.tsx

import React from 'react';

const IntegrationsTab: React.FC = () => {
  const handleConnectIntercom = () => {
    const clientId = process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/intercom/callback`;

    const intercomAuthUrl = `https://app.intercom.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=YOUR_SECURE_RANDOM_STATE`;

    window.location.href = intercomAuthUrl;
  };

  return (
    <div className="bg-card p-5 rounded-md">
      <h2 className="text-xl font-semibold text-primary">Integrations</h2>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-foreground">Intercom</h3>
        <p className="text-muted-foreground mt-2">
          Connect your Intercom account to import conversations and analyze customer feedback.
        </p>
        <button
          onClick={handleConnectIntercom}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80"
        >
          Connect to Intercom
        </button>
      </div>
    </div>
  );
};

export default IntegrationsTab;
